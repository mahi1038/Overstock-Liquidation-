import os
import pandas as pd
import numpy as np
from src import constants
from src.entity.config import TrainingConfig, DataIngestionConfig
from src.entity.artifact import DataIngestionArtifact
from src.utils.components_utils import convert_dataframe, add_features
from sklearn.model_selection import train_test_split

class DataIngestion:
    def __init__(self, data_ingestion_config = DataIngestionConfig):
        self.data_ingestion_config = data_ingestion_config

    def load_data(self):
        calendar_df = pd.read_csv(self.data_ingestion_config.calendar_path)
        sales_df = pd.read_csv(self.data_ingestion_config.sales_path)
        prices_df = pd.read_csv(self.data_ingestion_config.prices_path)

        final_df = convert_dataframe(calendar_df, sales_df, prices_df)
        final_df = add_features(final_df)
        final_columns = final_columns = ['item_id', 'dept_id', 'store_id', 'state_id', 'weekday', 'month', 'week_of_month', 'event_name_1', 'event_type_1', 'event_name_2',
                 'event_type_2', 'snap_active', 'sell_price', 'lag_28', 'lag_7', 'rolling_mean_28',  'price_pct_change', 'zero_streak', 'sales_28_sum']
        return final_df[final_columns]
    
    def begin_train_test_split(self, dataframe):
        train_df, test_df = train_test_split(dataframe,test_size = self.data_ingestion_config.train_test_ratio, random_state = 42)

        dir_name = os.path.dirname(self.data_ingestion_config.train_path)
        os.makedirs(dir_name, exist_ok = True)

        train_df.to_csv(self.data_ingestion_config.train_path, index = False)
        test_df.to_csv(self.data_ingestion_config.test_path, index = False)

    def initiate_data_ingestion(self):
        final_df = self.load_data()
        self.begin_train_test_split(final_df)
        data_ingestion_artifact = DataIngestionArtifact(self.data_ingestion_config.train_path, self.data_ingestion_config.test_path)
        return data_ingestion_artifact




