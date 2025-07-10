from dotenv import load_dotenv
import pandas as pd
import numpy as np
from sqlalchemy import create_engine
from src.utils.components_utils import add_features
import os

""" 
This is the DataPusher class that will push the data to the database which will be displayed in the frontend.
here the sales path is path to sales_train_evaluation.csv
"""

class DataPusher:
    def __init__(self, sales_path, calendar_path, prices_path):
        self.sales_path = sales_path
        self.calendar_path = calendar_path
        self.prices_path = prices_path

    def get_evaluation_dataframe(self):
       
     sales = pd.read_csv(self.sales_path)
     prices = pd.read_csv(self.prices_path)
     calendar = pd.read_csv(self.calendar_path)
     start_col = 1853
     end_col = 1913

     col = [f'd_{x}' for x in range(start_col, end_col + 1)]
     columns = ['id', 'item_id', 'dept_id', 'cat_id', 'store_id', 'state_id'] + col
     sub_evaluation_df = sales[columns]
    
     final_df = sub_evaluation_df.melt(
        id_vars=['id', 'item_id', 'dept_id', 'cat_id', 'store_id', 'state_id'],
        var_name='d',
         value_name='sales'
     )

     final_df = final_df.merge(calendar, how='left', on='d')
     final_df = final_df.merge(prices, how='left', on=['store_id', 'item_id', 'wm_yr_wk'])

     final_df['date'] = pd.to_datetime(final_df['date'])

        final_df = add_features(final_df)

        final_columns = ['d', 'item_id', 'dept_id', 'store_id', 'state_id', 'weekday', 'month', 'week_of_month', 'event_name_1', 'event_type_1', 'event_name_2',
                 'event_type_2', 'snap_active', 'sell_price', 'lag_28', 'lag_7', 'rolling_mean_28',  'price_pct_change', 'zero_streak', 'sales_28_sum']
        
        final_df = final_df.dropna(subset=['lag_28', 'lag_7', 'rolling_mean_28', 'sales_28_sum', 'price_pct_change', 'zero_streak'])
        return final_df[final_columns]





    