import numpy as np
import pandas as pd
import os
from src.entity.config import ModelTrainerConfig, TrainingConfig, DataIngestionConfig
from src.entity.artifact import DataTransformationArtifact, ClassificationMetric, ModelTrainerArtifact
from src.utils.components_utils import save_model_as_joblib, calculate_rmsle, calculate_smape
import catboost as cb
from sklearn.metrics import mean_squared_error
import joblib

class ModelTrainer:
    def __init__(self, data_transformation_artifact: DataTransformationArtifact, model_trainer_config: ModelTrainerConfig):
        self.data_transformation_artifact = data_transformation_artifact
        self.model_trainer_config = model_trainer_config
        
        # CatBoost parameters
        self.catboost_params = {
            'loss_function': 'RMSE',
            'eval_metric': 'RMSE',
            'learning_rate': 0.08,
            'depth': 7,
            'l2_leaf_reg': 0.5,
            'border_count': 254,
            'random_seed': 42,
            'verbose': 100,
            'allow_writing_files': False,
            'thread_count': -1,
            'bootstrap_type': 'Bernoulli',
            'subsample': 0.85,
            'colsample_bylevel': 0.85,
            'min_data_in_leaf': 5,
            'max_leaves': 127,
            'grow_policy': 'Lossguide',
            'leaf_estimation_iterations': 15,
            'boost_from_average': True,
            'od_type': 'Iter',
            'od_wait': 100,
        }

    def train_catboost(self, X_train, y_train_log, X_test, y_test_log):
        """Train CatBoost model"""
        print("🟦 Training CatBoost model...")
        
        train_pool = cb.Pool(X_train, y_train_log)
        eval_pool = cb.Pool(X_test, y_test_log)
        
        model = cb.CatBoostRegressor(iterations=3000, **self.catboost_params)
        
        model.fit(
            train_pool,
            eval_set=eval_pool,
            use_best_model=True,
            plot=False,
            early_stopping_rounds=100,
            verbose_eval=100
        )
        
        return model

    def save_model(self, model, model_path):
        """Save CatBoost model"""
        os.makedirs(os.path.dirname(model_path), exist_ok=True)
        joblib.dump(model, model_path)
        print(f"💾 CatBoost model saved to: {model_path}")

    def initiate_model_training(self):
        print("🔁 Loading transformed data...")
        train_loaded = np.load(self.data_transformation_artifact.transformed_train_file_path, allow_pickle=True)
        train_arr_loaded = train_loaded['data']

        test_loaded = np.load(self.data_transformation_artifact.transformed_test_file_path, allow_pickle=True)
        test_arr_loaded = test_loaded["data"]

        if train_arr_loaded.ndim == 1:
            train_arr_loaded = train_arr_loaded.reshape(1, -1)
        if test_arr_loaded.ndim == 1:
            test_arr_loaded = test_arr_loaded.reshape(1, -1)

        X_train = train_arr_loaded[:, :-1]
        y_train = train_arr_loaded[:, -1]
        X_test = test_arr_loaded[:, :-1]
        y_test = test_arr_loaded[:, -1]

        print("🔎 Checking for NaNs in labels...")
        y_train = pd.to_numeric(y_train, errors='coerce')
        y_test = pd.to_numeric(y_test, errors='coerce')

        if np.isnan(y_train).any():
            raise ValueError("🚨 y_train contains NaNs after conversion to numeric.")
        if np.isnan(y_test).any():
            raise ValueError("🚨 y_test contains NaNs after conversion to numeric.")

        print("📐 Applying log1p transformation to labels...")
        y_train_log = np.log1p(y_train)
        y_test_log = np.log1p(y_test)

        print("🧠 Starting CatBoost model training...")
        
        # Train CatBoost model
        catboost_model = self.train_catboost(X_train, y_train_log, X_test, y_test_log)
        
        # Make predictions in log space
        train_pred_log = catboost_model.predict(X_train)
        test_pred_log = catboost_model.predict(X_test)
        
        # Transform predictions back to original scale
        y_train_pred = np.expm1(train_pred_log)
        y_test_pred = np.expm1(test_pred_log)
        y_train_true = np.expm1(y_train_log)
        y_test_true = np.expm1(y_test_log)
        
        # Save model
        self.save_model(catboost_model, self.model_trainer_config.model_file_path)
        
        print("🧪 Calculating evaluation metrics...")
        test_metric = ClassificationMetric(
            rmsle_value=calculate_rmsle(y_test_true, y_test_pred),
            smape_value=calculate_smape(y_test_true, y_test_pred)
        )

        train_metric = ClassificationMetric(
            rmsle_value=calculate_rmsle(y_train_true, y_train_pred),
            smape_value=calculate_smape(y_train_true, y_train_pred)
        )

        # Save predictions
        y_future = pd.DataFrame(y_train_true)
        os.makedirs(os.path.dirname(self.model_trainer_config.trained_y), exist_ok=True)
        y_future.to_csv(self.model_trainer_config.trained_y, index=False)

        model_trainer_artifact = ModelTrainerArtifact(
            trained_model_file_path=self.model_trainer_config.model_file_path,
            test_metrics=test_metric,
            train_metrics=train_metric,
            predicted_path=self.model_trainer_config.trained_y
        )
        
        print(f"\n🎯 [CATBOOST RESULTS]")
        print(f"   Train RMSLE: {train_metric.rmsle_value:.6f}, Test RMSLE: {test_metric.rmsle_value:.6f}")
        print(f"   Train SMAPE: {train_metric.smape_value:.6f}, Test SMAPE: {test_metric.smape_value:.6f}")
        
        print("🎉 CatBoost model training completed.")
        return model_trainer_artifact