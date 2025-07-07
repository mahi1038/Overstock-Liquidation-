import pandas as pd
import numpy as np



def convert_dataframe(path1: str, path2: str, path3: str) -> pd.DataFrame:
    """
    this function merges all the three dataframes and return a final_df
    """
    calendar = pd.read_csv(path1)
    sales = pd.read_csv(path2)
    prices = pd.read_csv(path3)

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

    return final_df


