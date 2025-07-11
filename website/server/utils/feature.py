import pandas as pd
from datetime import timedelta
from config.mongodb import sales_collection

def compute_features_from_mongo(item_id: str, store_id: str, current_date):
    start_date = current_date - timedelta(days=60)

    cursor = sales_collection.find({
        "item_id": item_id,
        "store_id": store_id,
        "date": {"$gte": start_date, "$lt": current_date},
        "sales": {"$exists": True}
    })

    df = pd.DataFrame(list(cursor))

    if df.empty or 'date' not in df.columns:
        return {
            "lag_7": 0,
            "lag_28": 0,
            "rolling_mean_28": 0,
            "zero_streak": 0,
        }

    df['date'] = pd.to_datetime(df['date'])
    df = df.sort_values('date')

    # Reindex with all dates in range
    full_dates = pd.date_range(start=df['date'].min(), end=current_date - timedelta(days=1))
    df = df.set_index('date').reindex(full_dates).fillna({
        "sales": 0,
        "item_id": item_id,
        "store_id": store_id,
    }).rename_axis('date').reset_index()
    df['id'] = f"{item_id}_{store_id}"

    df = df.sort_values(['id', 'date'])

    # Compute lag values using shift
    df['lag_7'] = df.groupby('id')['sales'].shift(7)
    df['lag_28'] = df.groupby('id')['sales'].shift(28)

    # Compute other features
    df['rolling_mean_28'] = (
        df.groupby('id')['sales']
        .transform(lambda x: x.shift(1).rolling(window=28, min_periods=1).mean())
    )

    df['zero_streak'] = (
        df.groupby('id')['sales']
        .transform(lambda x: x.eq(0).astype(int).groupby(x.ne(0).cumsum()).cumsum())
    )

    latest_row = df.iloc[-1]

    return {
        "lag_7": int(latest_row['lag_7']) if pd.notna(latest_row['lag_7']) else 0,
        "lag_28": int(latest_row['lag_28']) if pd.notna(latest_row['lag_28']) else 0,
        "rolling_mean_28": float(latest_row['rolling_mean_28']) if pd.notna(latest_row['rolling_mean_28']) else 0,
        "zero_streak": int(latest_row['zero_streak']) if pd.notna(latest_row['zero_streak']) else 0,
    }
