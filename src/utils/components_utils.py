import pandas as pd
import numpy as np
import datetime as dt
import os
import pickle


def convert_dataframe(calendar, sales, prices) -> pd.DataFrame:
    """
    this function merges all the three dataframes and return a final_df
    """
    start_col = 1789
    end_col = 1913

    col = [f'd_{x}' for x in range(start_col, end_col + 1)]
    columns = ['id', 'item_id', 'dept_id', 'cat_id', 'store_id', 'state_id'] + col
    sub_validation_df = sales[columns]
    final_df = sub_validation_df.melt(
        id_vars=['id', 'item_id', 'dept_id', 'cat_id', 'store_id', 'state_id'],
        var_name='d',
        value_name='sales'
    )

    final_df = final_df.merge(calendar, how = 'left', on = 'd')

    final_df = final_df.merge(prices, how = 'left', on = ['store_id', 'item_id', 'wm_yr_wk'])

    final_df['date'] = pd.to_datetime(final_df['date'])

    return final_df



def add_features(data_df : pd.DataFrame) -> pd.DataFrame:
    """
    This fucntion is responsible for feature engineering 
    """
    data_df = data_df.sort_values(['id', 'date'])

    ## create lag of 28
    data_df['lag_28'] = (
        data_df
        .groupby('id')['sales']
        .shift(28)
    )

    ## create lag of 7
    data_df['lag_7'] = (
        data_df
        .groupby('id')['sales']
        .shift(7)
    )

    ## rolling mean of 28
    data_df['rolling_mean_28'] = (
        data_df
        .groupby('id')['sales']
        .transform(
            lambda x: x.shift(1).rolling(window=28).mean()
        )
    )

    # ## percent price change feature
    data_df["price_pct_change"] = (
        data_df.groupby("id")["sell_price"]
        .pct_change(fill_method = None).fillna(0)
    )

    # ## zero streaks
    data_df["zero_streak"] = (
        data_df.groupby("id")["sales"]
        .transform(lambda x: x.eq(0).astype(int).groupby(x.ne(0).cumsum()).cumsum())
    )


    ## calendar features
    data_df['month'] = data_df['date'].dt.month
    data_df['year'] = data_df['date'].dt.year

    data_df['day_of_month'] = data_df['date'].dt.day
    data_df['week_of_month'] = ((data_df['day_of_month'] - 1) // 7) + 1


    ## adding a snap_active feature
    conditions = [
    data_df["state_id"] == "CA",
    data_df["state_id"] == "TX",
    data_df["state_id"] == "WI"
    ]

    choices = [
        data_df["snap_CA"],
        data_df["snap_TX"],
        data_df["snap_WI"]
    ]
    data_df["snap_active"] = np.select(conditions, choices, default=0)
    data_df.drop(['snap_CA', 'snap_TX', 'snap_WI'], axis = 1)


    ## target columns
    ## Reverse the time series so rolling looks "forward"
    data_df['sales_28_sum'] = (
        data_df
        .iloc[::-1]                                 
        .groupby('id')['sales']
        .rolling(window=28, min_periods=28)
        .sum()
        .reset_index(level=0, drop=True)
        .iloc[::-1]                               
    )

    return data_df


'''
Data Transformation uitls
'''
def save_npz_array_data(filepath: str, array: np.array):
    os.makedirs(os.path.dirname(filepath), exist_ok = True)
    with open(filepath, 'wb') as file:
        np.savez_compressed(filepath, data=array) 


def save_object_pkl(filepath: str, obj: object):
    os.makedirs(os.path.dirname(filepath), exist_ok= True)
    with open(filepath, 'wb') as file:
        pickle.dump(obj, file)







