import numpy as np
import pandas as pd
import os
from src.entity.config import ModelTrainerConfig
from src.entity.artifact import DataTransformationArtifact, ClassificationMetric, ModelTrainerArtifact
from src.utils.components_utils import save_model_as_joblib, calculate_rmsle, calculate_smape
import lightgbm as lgb

class ModelTrainer:
    def __init__(self, data_transformation_artifact: DataTransformationArtifact, model_trainer_config: ModelTrainerConfig):
        self.data_transformation_artifact = data_transformation_artifact
        self.model_trainer_config = model_trainer_config

    def initiate_model_training(self):
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

        y_train = pd.to_numeric(y_train, errors='coerce')
        y_test = pd.to_numeric(y_test, errors='coerce')

        if np.isnan(y_train).any():
            raise ValueError("y_train contains NaNs after conversion to numeric.")
        if np.isnan(y_test).any():
            raise ValueError("y_test contains NaNs after conversion to numeric.")

        y_train_log = np.log1p(y_train)
        y_test_log = np.log1p(y_test)

        lgb_train = lgb.Dataset(X_train, label=y_train_log)
        lgb_eval = lgb.Dataset(X_test, label=y_test_log, reference=lgb_train)

        params = {
            'objective': 'regression',
            'metric': 'rmse',
            'learning_rate': 0.0489421713498363,
            'num_leaves': 54,
            'max_depth': 10,
            'min_child_samples': 99,
            'subsample': 0.7347890502280104,
            'colsample_bytree': 0.798446419571102,
            'reg_alpha': 0.10012076739146288,
            'reg_lambda': 0.2318596687456266,
            'verbose': -1
        }

        model = lgb.train(
            params,
            lgb_train,
            valid_sets=[lgb_train, lgb_eval],
            num_boost_round=1000,
            callbacks=[
                lgb.early_stopping(stopping_rounds=50, verbose=False),
                lgb.log_evaluation(period=100)
            ],
        )

        y_test_pred_log = model.predict(X_test, num_iteration=model.best_iteration)
        y_test_pred = np.expm1(y_test_pred_log)

        y_train_pred_log = model.predict(X_train, num_iteration=model.best_iteration)
        y_train_pred = np.expm1(y_train_pred_log)

        y_test_true = np.expm1(y_test_log)
        y_train_true = np.expm1(y_train_log)

        save_model_as_joblib(self.model_trainer_config.model_file_path, model)

        test_classification_metric = ClassificationMetric(
            rmsle_value=calculate_rmsle(y_test_true, y_test_pred),
            smape_value=calculate_smape(y_test_true, y_test_pred)
        )

        train_classification_metric = ClassificationMetric(
            rmsle_value=calculate_rmsle(y_train_true, y_train_pred),
            smape_value=calculate_smape(y_train_true, y_train_pred)
        )

        model_trainer_artifact = ModelTrainerArtifact(
            trained_model_file_path=self.model_trainer_config.model_file_path,
            test_metrics=test_classification_metric,
            train_metrics=train_classification_metric
        )

        return model_trainer_artifact

