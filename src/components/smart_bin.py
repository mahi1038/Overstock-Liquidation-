# src/components/smart_binning.py
import os
import pandas as pd
import numpy as np
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.decomposition import TruncatedSVD
from sklearn.cluster import MiniBatchKMeans
from src.entity.config import SmartBinningConfig
from src.entity.artifact import SmartBinningArtifact
from scipy.sparse import hstack, csr_matrix

class SmartBinning:
    def __init__(self, input_data_frame: pd.DataFrame, smart_binning_config: SmartBinningConfig):
        self.df     = input_data_frame.copy()
        self.config = smart_binning_config
        # self.smart_binning_config = smart_binning_config

    def run(self):
        # 1) FEATURE ENGINEERING
        df = self.df
        df['overstock_score']  = ((df['actual_stock'] - df['future_sales']) 
                                  / df['future_sales']).astype('float32')
        df['days_of_supply']   = (df['actual_stock'] 
                                  / df['rolling_mean_28'].replace(0, np.nan)).astype('float32')
        df['turnover_rate_28'] = ((df['rolling_mean_28'] * 28) 
                                  / df['actual_stock'].replace(0, np.nan)).astype('float32')
        
        # ✂️ CLEAN INF/−INF → NaN
        df.replace([np.inf, -np.inf], np.nan, inplace=True)

        # 2) CATEGORICAL ENCODING
        cat_cols = ['dept_id','store_id','state_id','weekday',
                    'event_type_1','event_type_2','snap_active']
        ohe = OneHotEncoder(dtype='uint8', handle_unknown='ignore')
        X_cat = ohe.fit_transform(df[cat_cols])
      

        # 3) NUMERIC FEATURES & SCALING
        num_cols = ['overstock_score','days_of_supply','turnover_rate_28',
                    'price_pct_change','lag_28','lag_7','rolling_mean_28','zero_streak']
        X_num = df[num_cols].fillna(0).values
        scaler = StandardScaler()
        X_num_scaled = scaler.fit_transform(X_num)
        

        # 4) STACK & DIM‑REDUCE
        X = hstack([csr_matrix(X_num_scaled), X_cat], format='csr')
        svd = TruncatedSVD(n_components=20, random_state=0)
        X_reduced = svd.fit_transform(X)
    

        # 5) CLUSTERING INTO BINS
        mbk = MiniBatchKMeans(
            n_clusters=self.config.n_clusters,
            batch_size=10000,
            random_state=0
        )
        df['bin_id'] = mbk.fit_predict(X_reduced)
      

        # 6) ASSIGN TIERED DISCOUNTS
        bin_avg = df.groupby('bin_id')['overstock_score'].mean()
        def tiered(o):
            if o > 0.5: return 0.20
            if o > 0.3: return 0.15
            if o > 0.1: return 0.10
            return 0.05
        df['discount'] = df['bin_id'].map(bin_avg.map(tiered)).astype('float32')

        # 7) CLUBBING HIGH‑PRIORITY BINS (example bins 1 & 2)
        high_pri = [1, 2]
        df['clubbed_bin_id'] = df['bin_id']
        mask = df['bin_id'].isin(high_pri)
        df.loc[mask, 'clubbed_bin_id'] = 99
        df.loc[mask, 'discount']       = 0.30

        # 8) WRITE OUT ARTIFACTS
        os.makedirs(os.path.dirname(self.config.smart_binning_smart_bins_file_path), exist_ok=True)
        # full detail
        df.to_csv(
            self.config.smart_binning_smart_bins_file_path,
            index=False
        )

        # summary + strategies
        summary = (
            df.groupby('clubbed_bin_id')
              .agg(
                  clubbed_bins      = ('bin_id', lambda x: ' && '.join(sorted(map(str, set(x))))),
                  suitable_discount = ('discount','first'),
                  avg_overstock     = ('overstock_score','mean')
              )
              .reset_index(drop=True)
        )
        summary['priority_score']    = summary['avg_overstock']
        summary['avg_overstock_pct'] = (summary['avg_overstock'] * 100).round(1)

        summary.to_csv(
            self.config.smart_binning_summary_file_path,
            index=False
        )
        summary[['clubbed_bins','suitable_discount','priority_score','avg_overstock_pct']].to_csv(
            self.config.smart_binning_strategies_file_path,
            index=False
        )

        smart_binning_artifact = SmartBinningArtifact(smart_binning_smart_bins=self.config.smart_binning_smart_bins_file_path,
                                                      smart_binning_strategies=self.config.smart_binning_summary_file_path,
                                                      smart_binning_summary=self.config.smart_binning_strategies_file_path)
        

        print(f"✅ Smart‑binning artifacts saved")

        return smart_binning_artifact


