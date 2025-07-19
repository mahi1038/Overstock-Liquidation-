import pandas as pd
import numpy as np
import os
from src.components.data_ingestion import DataIngestion
from src.components.data_transformation import DataTransformation
from src.components.model_trainer import ModelTrainer
from src.entity.config import DataIngestionConfig, TrainingConfig, DataTransformationConfig, ModelTrainerConfig
from datetime import datetime

'''from src.components.smart_binning import (
    run_smart_binning,
    score_bins,
    simulate_clearance,
    suggest_clearance_strategy
)'''


if __name__ == '__main__':
    print("✅ Starting training pipeline")

    training_config = TrainingConfig(datetime.now())
    print("📦 Training config created")

    data_ingestion_config = DataIngestionConfig(training_config)
    data_ingestion = DataIngestion(data_ingestion_config)
    data_ingestion_artifact = data_ingestion.initiate_data_ingestion()
    sb_dataframe = pd.read_csv(data_ingestion_artifact.train_path)
    print("📥 Data ingestion complete")

    data_transformation_config = DataTransformationConfig(training_config)
    data_transformation = DataTransformation(data_ingestion_artifact, data_transformation_config)
    data_transformation_artifact = data_transformation.initiate_data_transformation()
    print("🔄 Data transformation complete")

    model_trainer_config = ModelTrainerConfig(training_config)
    model_trainer = ModelTrainer(data_transformation_artifact, model_trainer_config)
    model_trainer_artifact = model_trainer.initiate_model_training()
    print("🤖 Model training complete")
    '''
    y_future = pd.read_csv(model_trainer_artifact.predicted_path)
    sb_dataframe.drop(columns = ['sales_28_sum'], axis = 1, inplace=True)
    sb_dataframe['future_sales'] = y_future

    smart_binning_dir = os.path.join("artifacts", "smart_binning")
    os.makedirs(smart_binning_dir, exist_ok=True)

    # Define output file path
    sb_dataframe_path = os.path.join(smart_binning_dir, "sb_dataframe.csv")

    # Save DataFrame
    sb_dataframe.to_csv(sb_dataframe_path, index=False)



    # ─── SMART BINNING & CLEARANCE PIPELINE ────────────────────────────────────────
    # print("📦 Running Smart Binning")

    # # Loading the transformed  array DataFrame
    # train_npz = np.load(data_transformation_artifact.transformed_train_file_path)
    # key = train_npz.files[0]
    # train_arr = train_npz[key]  # or use the correct key if different

    # # 2) Split into features (all columns except last) and target (last column)
    # X = train_arr[:, :-1]
    # y = train_arr[:,  -1]

    # # 3) Recover column names (you saved these as feature_names.npy)
    # feature_names_path = os.path.join(
    #     os.path.dirname(data_transformation_artifact.preprocessor_obj_file_path),
    #     "feature_names.npy"
    # )
    # feature_names = np.load(feature_names_path, allow_pickle=True)

    # # 4) Building our DataFrame
    # df_transformed = pd.DataFrame(X, columns=feature_names)
    # df_transformed['sales_28_sum'] = y  # or whatever your target column is

    # # Clustering into bins
    # df_binned, clusterer = run_smart_binning(df_transformed, visualize=False)
    # binned_path = os.path.join(training_config.artifact_dir_path, 'smart_binning.csv')
    # df_binned.to_csv(binned_path, index=False)
    # print(f"✅ Smart Binning saved to {binned_path}")

    # # Score each bin
    # bin_scores = score_bins(df_binned)

    # # Suggesting clearance strategies
    # strategy_df = suggest_clearance_strategy(bin_scores)
    # strategy_path = os.path.join(training_config.artifact_dir_path, 'bin_strategy.csv')
    # strategy_df.to_csv(strategy_path, index=False)
    # print(f"✅ Bin strategies saved to {strategy_path}")

    # # Simulating clearance campaigns
    # campaign_df = simulate_clearance(df_binned, bin_scores)
    # campaign_path = os.path.join(training_config.artifact_dir_path, 'campaign_simulation.csv')
    # campaign_df.to_csv(campaign_path, index=False)
    # print(f"✅ Campaign simulation saved to {campaign_path}")


    # print("📊 Metrics:")
    # print("Test RMSLE:", model_trainer_artifact.test_metrics.rmsle_value)
    # print("Test SMAPE:", model_trainer_artifact.test_metrics.smape_value)
    # print("Train RMSLE:", model_trainer_artifact.train_metrics.rmsle_value)
    # print("Train SMAPE:", model_trainer_artifact.train_metrics.smape_value)'''
