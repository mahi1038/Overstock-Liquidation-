import pandas as pd
import numpy as np
import os
from src.components.smart_bin import SmartBinning, SmartBinningConfig
from src.components.data_ingestion import DataIngestion
from src.components.data_transformation import DataTransformation
from src.components.model_trainer_2 import ModelTrainer
from src.entity.config import DataIngestionConfig, TrainingConfig, DataTransformationConfig, ModelTrainerConfig
from datetime import datetime
from src.components.smart_bin import SmartBinning

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


    # ─── load SB dataframe and MODEL PREDICTIONS ─────────────────────────────
    sb_path    = data_ingestion_artifact.train_path
    sb_df      = pd.read_csv(sb_path)
    print("📥 input_data read")
    preds_path = model_trainer_artifact.predicted_path
    y_future   = pd.read_csv(preds_path)
    print("📥 predicted_data read")
    # ensure the predictions column is named 'future_sales'
    if 'future_sales' not in y_future.columns:
        y_future.columns = ['future_sales']

    sb_df['future_sales'] = y_future['future_sales'].values
    print("📈 Added future_sales to SB dataframe")
    # ─────────────────────────────────────────────────────────────────────────

    # ─── synthesize actual_stock ─────────────────────────────────────────────
    np.random.seed(42)
    offsets = np.random.randint(-100, 101, size=len(sb_df))
    sb_df['actual_sales'] = (sb_df['future_sales'] + offsets).clip(lower=0)
    sb_df.rename(columns={'actual_sales':'actual_stock'}, inplace=True)
    print("🔄 SB dataframe enriched with actual_stock")
    # ─────────────────────────────────────────────────────────────────────────

    # ─── now run smart‑binning ───────────────────────────────────────────────

    smart_binning_config = SmartBinningConfig(training_config, n_clusters=15)
    smart_binning = SmartBinning(sb_df, smart_binning_config)
    smart_binning_artifact = smart_binning.run()
    print('📊  smart binning completed')

    # config = SmartBinningConfig(
    #     output_path=data_ingestion_config.artifact_dir,
    #     n_clusters=15
    # )
    # binner = SmartBinning(sb_df, config)
    # binner.run()
    # print("📊 Smart‑binning completed")
    # ─────────────────────────────────────────────────────────────────────────


#     input_path  = data_ingestion_artifact.train_path
#     input_df = pd.read_csv(input_path)
#     print("📥 input_data read")


# # we dont have actual_stock, so we synthesize it here
#     np.random.seed(42)
#     offsets = np.random.randint(-100, 101, size=len(input_df))
#     input_df['actual_sales'] = (input_df['future_sales'] + offsets).clip(lower=0)
#     input_df.rename(columns={'actual_sales':'actual_stock'}, inplace=True)
#     print("🔄 sb_dataframe transformation complete")







    
