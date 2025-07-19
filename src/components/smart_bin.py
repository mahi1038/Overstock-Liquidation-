import pandas as pd
import numpy as np
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.decomposition import TruncatedSVD
from sklearn.cluster import MiniBatchKMeans
from scipy.sparse import hstack

# 1) LOAD & DTYPE OPTIMIZATION
dtypes = {
    'item_id': 'object',
    'dept_id': 'category',
    'store_id': 'category',
    'state_id': 'category',
    'weekday': 'category',
    'month': 'uint8',
    'week_of_month': 'uint8',
    'event_name_1': 'category',
    'event_type_1': 'category',
    'event_name_2': 'category',
    'event_type_2': 'category',
    'snap_active': 'uint8',
    'sell_price': 'float32',
    'lag_28': 'float32',
    'lag_7': 'float32',
    'rolling_mean_28': 'float32',
    'price_pct_change': 'float32',
    'zero_streak': 'uint16',
    'future_sales': 'float32',
    'actual_stock': 'float32'
}
df = pd.read_csv('overstock_features.csv', dtype=dtypes)

# 2) QUICK HEALTH CHECK
print("Rows:", len(df))
print(df.dtypes)

# 3) FEATURE ENGINEERING (all vectorized)
df['overstock_score'] = (
    (df['actual_stock'] - df['future_sales'])
    / df['future_sales']
).astype('float32')

# avoid div0
df['days_of_supply'] = (
    df['actual_stock'] / df['rolling_mean_28'].replace(0, np.nan)
).astype('float32')

df['turnover_rate_28'] = (
    (df['rolling_mean_28'] * 28) / df['actual_stock'].replace(0, np.nan)
).astype('float32')

# 4) CATEGORICAL ENCODING (sparse)
cat_cols = ['dept_id','store_id','state_id','weekday',
            'event_type_1','event_type_2','snap_active']

# No sparse or sparse_output argument needed – it defaults to a sparse matrix
ohe = OneHotEncoder(dtype='uint8', handle_unknown='ignore')

# Then apply to your categorical columns:
cat_cols = ['dept_id', 'store_id', 'state_id', 'weekday',
            'event_type_1', 'event_type_2', 'snap_active']
X_cat = ohe.fit_transform(df[cat_cols])

# ohe = OneHotEncoder(dtype='uint8', sparse=True, handle_unknown='ignore')


# 5) NUMERIC MATRIX
num_cols = ['overstock_score','days_of_supply','turnover_rate_28',
            'price_pct_change','lag_28','lag_7','rolling_mean_28','zero_streak']
X_num = df[num_cols].fillna(0).values

# 6) SCALE NUMERICS
scaler = StandardScaler(with_mean=True, with_std=True)
X_num_scaled = scaler.fit_transform(X_num)

# 7) STACK FEATURES (sparse cat + dense num → sparse)
from scipy import sparse
X = hstack([sparse.csr_matrix(X_num_scaled), X_cat], format='csr')

# 8) DIM REDUCTION (TruncatedSVD on sparse)
svd = TruncatedSVD(n_components=20, random_state=0)
X_reduced = svd.fit_transform(X)  # → (750k, 20)

# 9) CLUSTERING (MiniBatchKMeans)
n_bins = 15
mbk = MiniBatchKMeans(
    n_clusters=n_bins,
    batch_size=10000,
    random_state=0
)
df['bin_id'] = mbk.fit_predict(X_reduced)

# 10) ASSIGN DISCOUNTS PER BIN
#    e.g. map average overstock_score to a tiered discount
bin_stats = df.groupby('bin_id')['overstock_score'].mean()
def tiered_discount(o):
    if o > 0.5:   return 0.20
    if o > 0.3:   return 0.15
    if o > 0.1:   return 0.10
    return 0.05

discount_map = bin_stats.map(tiered_discount)
df['discount'] = df['bin_id'].map(discount_map).astype('float32')

# 11) OUTPUT SUMMARY & STRATEGIES
summary = df.groupby('bin_id').agg(
    sku_count=('item_id','count'),
    avg_overstock=('overstock_score','mean'),
    assigned_discount=('discount','first')
).sort_values('avg_overstock', ascending=False)

print(summary)

# 12) SAVE FOR WEB
df.to_csv('smart_bins_full.csv', index=False)
summary.to_csv('smart_bins_summary.csv')
