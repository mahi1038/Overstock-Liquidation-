# src/components/smart_binning.py
import os
import pandas as pd
import numpy as np
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.decomposition import TruncatedSVD
from sklearn.cluster import MiniBatchKMeans
from scipy.sparse import hstack, csr_matrix

class SmartBinningConfig:
    """
    Configuration for SmartBinning:
      - output_path: directory where CSVs will be saved
      - n_clusters: number of clusters/bins
    """
    def __init__(self, output_path: str, n_clusters: int = 15):
        self.output_path  = output_path
        self.n_clusters   = n_clusters

class SmartBinning:
    def __init__(self, input_data_frame: pd.DataFrame, smart_binning_config: SmartBinningConfig):
        self.df     = input_data_frame.copy()
        self.config = smart_binning_config

    def run(self):
        # 1) FEATURE ENGINEERING
        df = self.df
        df['overstock_score']  = ((df['actual_stock'] - df['future_sales']) 
                                  / df['future_sales']).astype('float32')
        df['days_of_supply']   = (df['actual_stock'] 
                                  / df['rolling_mean_28'].replace(0, np.nan)).astype('float32')
        df['turnover_rate_28'] = ((df['rolling_mean_28'] * 28) 
                                  / df['actual_stock'].replace(0, np.nan)).astype('float32')

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
        os.makedirs(self.config.output_path, exist_ok=True)
        # full detail
        df.to_csv(
            os.path.join(self.config.output_path, 'smart_bins_full.csv'),
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
            os.path.join(self.config.output_path, 'smart_bins_summary.csv'),
            index=False
        )
        summary[['clubbed_bins','suitable_discount','priority_score','avg_overstock_pct']].to_csv(
            os.path.join(self.config.output_path, 'strategies.csv'),
            index=False
        )

        print(f"✅ Smart‑binning artifacts written to {self.config.output_path}")


# import pandas as pd
# import numpy as np
# from sklearn.preprocessing import OneHotEncoder, StandardScaler
# from sklearn.decomposition import TruncatedSVD
# from sklearn.cluster import MiniBatchKMeans
# from scipy.sparse import hstack

# def run_smart_binning(input_csv: str, output_dir: str):
#     # 1) LOAD & DTYPE OPTIMIZATION
#     dtypes = {
#         'item_id': 'object',
#         'dept_id': 'category',
#         'store_id': 'category',
#         'state_id': 'category',
#         'weekday': 'category',
#         'month': 'uint8',
#         'week_of_month': 'uint8',
#         'event_name_1': 'category',
#         'event_type_1': 'category',
#         'event_name_2': 'category',
#         'event_type_2': 'category',
#         'snap_active': 'uint8',
#         'sell_price': 'float32',
#         'lag_28': 'float32',
#         'lag_7': 'float32',
#         'rolling_mean_28': 'float32',
#         'price_pct_change': 'float32',
#         'zero_streak': 'uint16',
#         'future_sales': 'float32',
#         'actual_stock': 'float32'
#     }
#     df = pd.read_csv('overstock_features.csv', dtype=dtypes)

#     # 2) QUICK HEALTH CHECK
#     print("Rows:", len(df))
#     print(df.dtypes)

#     # 3) FEATURE ENGINEERING (all vectorized)
#     df['overstock_score'] = (
#         (df['actual_stock'] - df['future_sales'])
#         / df['future_sales']
#     ).astype('float32')

#     # avoid div0
#     df['days_of_supply'] = (
#         df['actual_stock'] / df['rolling_mean_28'].replace(0, np.nan)
#     ).astype('float32')

#     df['turnover_rate_28'] = (
#         (df['rolling_mean_28'] * 28) / df['actual_stock'].replace(0, np.nan)
#     ).astype('float32')

#     # 4) CATEGORICAL ENCODING (sparse)
#     cat_cols = ['dept_id','store_id','state_id','weekday',
#                 'event_type_1','event_type_2','snap_active']

#     # No sparse or sparse_output argument needed – it defaults to a sparse matrix
#     ohe = OneHotEncoder(dtype='uint8', handle_unknown='ignore')

#     # Then apply to your categorical columns:
#     cat_cols = ['dept_id', 'store_id', 'state_id', 'weekday',
#                 'event_type_1', 'event_type_2', 'snap_active']
#     X_cat = ohe.fit_transform(df[cat_cols])

#     # ohe = OneHotEncoder(dtype='uint8', sparse=True, handle_unknown='ignore')


#     # 5) NUMERIC MATRIX
#     num_cols = ['overstock_score','days_of_supply','turnover_rate_28',
#                 'price_pct_change','lag_28','lag_7','rolling_mean_28','zero_streak']
#     X_num = df[num_cols].fillna(0).values

#     # 6) SCALE NUMERICS
#     scaler = StandardScaler(with_mean=True, with_std=True)
#     X_num_scaled = scaler.fit_transform(X_num)

#     # 7) STACK FEATURES (sparse cat + dense num → sparse)
#     from scipy import sparse
#     X = hstack([sparse.csr_matrix(X_num_scaled), X_cat], format='csr')

#     # 8) DIM REDUCTION (TruncatedSVD on sparse)
#     svd = TruncatedSVD(n_components=20, random_state=0)
#     X_reduced = svd.fit_transform(X)  # → (750k, 20)

#     # 9) CLUSTERING (MiniBatchKMeans)
#     n_bins = 15
#     mbk = MiniBatchKMeans(
#         n_clusters=n_bins,
#         batch_size=10000,
#         random_state=0
#     )
#     df['bin_id'] = mbk.fit_predict(X_reduced)

#     # 10) ASSIGN DISCOUNTS PER BIN
#     #    e.g. map average overstock_score to a tiered discount
#     bin_stats = df.groupby('bin_id')['overstock_score'].mean()
#     def tiered_discount(o):
#         if o > 0.5:   return 0.20
#         if o > 0.3:   return 0.15
#         if o > 0.1:   return 0.10
#         return 0.05

#     discount_map = bin_stats.map(tiered_discount)
#     df['discount'] = df['bin_id'].map(discount_map).astype('float32')

#     # 11) OUTPUT SUMMARY & STRATEGIES
#     summary = df.groupby('bin_id').agg(
#         sku_count=('item_id','count'),
#         avg_overstock=('overstock_score','mean'),
#         assigned_discount=('discount','first')
#     ).sort_values('avg_overstock', ascending=False)

#     print(summary)

#     # 12) SAVE FOR WEB
#     df.to_csv('smart_bins_full.csv', index=False)
#     summary.to_csv('smart_bins_summary.csv')
