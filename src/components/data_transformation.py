import pandas as pd
import numpy as np
from src.entity.artifact import DataIngestionArtifact, DataTransformationArtifact
from src.entity.config import DataTransformationConfig
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from src.utils.components_utils import save_npz_array_data, save_object_pkl
from joblib import parallel_backend
import os

class EventFiller(BaseEstimator, TransformerMixin):
    def __init__(self, event_cols):
        self.event_cols = event_cols

    def fit(self, X, y=None):
        return self

    def transform(self, X):
        for col in self.event_cols:
            if col in X.columns:
                X[col] = X[col].fillna("No_event")
        return X

class LabelEncodingTransformer(BaseEstimator, TransformerMixin):
    def __init__(self, cols):
        self.cols = cols
        self.encoders = {}

    def fit(self, X, y=None):
        for col in self.cols:
            if col in X.columns:
                le = LabelEncoder()
                le.fit(X[col].astype(str))
                self.encoders[col] = le
        return self

    def transform(self, X):
        for col in self.cols:
            if col in X.columns:
                le = self.encoders[col]
                mask = X[col].isin(le.classes_)
                X.loc[mask, col] = le.transform(X.loc[mask, col])
                X[col] = X[col].fillna(-1)
                return X


class ColumnSelector(BaseEstimator, TransformerMixin):
    def __init__(self, cols):
        self.cols = cols

    def fit(self, X, y=None):
        return self

    def transform(self, X):
        return X[self.cols]


class DataTransformation:
    def __init__(
        self,
        data_ingestion_artifact: DataIngestionArtifact,
        data_transformation_config: DataTransformationConfig
    ):
        self.data_ingestion_artifact = data_ingestion_artifact
        self.data_transformation_config = data_transformation_config

    def create_ml_pipeline(self):
        event_cols = ['event_name_1', 'event_type_1', 'event_name_2', 'event_type_2']
        label_cols = ['item_id', 'dept_id', 'store_id', 'weekday', 'state_id'] + event_cols
        numeric_cols = ['sell_price', 'lag_28', 'lag_7', 'rolling_mean_28', 'price_pct_change', 'zero_streak']

        # Pipeline
        pipeline = Pipeline([
            ('fill_events', EventFiller(event_cols=event_cols)),
            ('label_encode', LabelEncodingTransformer(cols=label_cols)),
            ('scaler', ColumnTransformer(transformers=[
                ('scale_num', StandardScaler(), numeric_cols)
            ], remainder='passthrough'))
        ])

        return pipeline

    def initiate_data_transformation(self):

        train_df = pd.read_csv(self.data_ingestion_artifact.train_path)
        test_df = pd.read_csv(self.data_ingestion_artifact.test_path)
        print('initiated data transformation')

        drop_cols = ['lag_28', 'lag_7','rolling_mean_28', 'sales_28_sum', 'price_pct_change', 'zero_streak']

        train_df = train_df.dropna(subset=drop_cols)
        test_df = test_df.dropna(subset=drop_cols)

        if train_df.shape[0] == 0:
            raise ValueError("Training set is empty after dropping missing values.")

        if test_df.shape[0] == 0:
            raise ValueError("Test set is empty after dropping missing values.")
        
        for df in [train_df, test_df]:
            if 'sell_price' in df.columns:
                df['sell_price'] = (
                    df.groupby(['store_id', 'item_id'])['sell_price']
                    .transform(lambda x: x.ffill().bfill())
                )

        target_col = self.data_transformation_config.target_column

        if target_col not in train_df.columns:
            raise ValueError(f"Target column {target_col} not found in training data.")

        X_train_df = train_df.drop(columns=[target_col], axis=1)
        y_train_df = train_df[target_col]

        X_test_df = test_df.drop(columns=[target_col], axis=1)
        y_test_df = test_df[target_col]


        pipeline = self.create_ml_pipeline()
        print('created ml pipeline')


        numeric_cols = ['sell_price', 'lag_28', 'lag_7', 'rolling_mean_28', 'price_pct_change', 'zero_streak']
        available_numeric_cols = [col for col in numeric_cols if col in X_train_df.columns]
        pipeline.named_steps['scaler'].transformers = [('scale_num', StandardScaler(), available_numeric_cols)]

        with parallel_backend('threading', n_jobs = -1):
            pipeline.fit(X_train_df)

        transformed_train = pipeline.transform(X_train_df)
        transformed_test = pipeline.transform(X_test_df)
        # transformed_train = transformed_train.astype(np.float32)
        # transformed_test = transformed_test.astype(np.float32)
        print('data transformation done')

        train_arr = np.c_[transformed_train, np.array(y_train_df)]
        test_arr = np.c_[transformed_test, np.array(y_test_df)]

        save_npz_array_data(self.data_transformation_config.transformed_train_path, train_arr)
        save_npz_array_data(self.data_transformation_config.transformed_test_path, test_arr)

        save_object_pkl(self.data_transformation_config.preprocessor_obj_file_path, pipeline)
        print('saved the objects')

        feature_names_path = os.path.join(os.path.dirname(self.data_transformation_config.preprocessor_obj_file_path), "feature_names.npy")
        np.save(feature_names_path, np.array(X_train_df.columns))
        print(X_train_df.columns)

        data_transformation_artifact = DataTransformationArtifact(
            transformed_train_file_path=self.data_transformation_config.transformed_train_path,
            transformed_test_file_path=self.data_transformation_config.transformed_test_path,
            preprocessor_obj_file_path=self.data_transformation_config.preprocessor_obj_file_path
        )
        print('returned data transformation artifact')

        return data_transformation_artifact
