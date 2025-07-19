import pandas as pd
import numpy as np
import os
from src.components.smart_bin import SmartBinning, SmartBinningConfig
from src.components.data_ingestion import DataIngestion
from src.components.data_transformation import DataTransformation
from src.components.model_trainer_2 import ModelTrainer
from src.entity.config import DataIngestionConfig, TrainingConfig, DataTransformationConfig, ModelTrainerConfig
from datetime import datetime
from src.components.smart_bin import run_smart_binning

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
    # y_future = pd.read_csv(model_trainer_artifact.predicted_path)
    #sb_dataframe.drop(columns = ['sales_28_sum'], axis = 1, inplace=True)
    #sb_dataframe['future_sales'] = y_future


   # ─── SMART‑BINNING ─────────────────────────────────────────────────────────
   # Once sb_dataframe.csv exists in artifacts, run your smart_bin.py logic:
   
    # Defining paths for input SB dataframe and output artifacts directory
    input_csv  = data_ingestion_artifact.train_path     # e.g., 'artifacts/sb_dataframe.csv'
    output_dir = data_ingestion_config.artifact_dir     # same 'artifacts/' folder

    # this function should read input_csv, generate summary files, and write them into output_dir
    # after training produces sb_dataframe.csv as a DataFrame `sb_df`:
    config = SmartBinningConfig(output_path=data_ingestion_config.artifact_dir, n_clusters=15)
    binner = SmartBinning(input_data_frame=sb_df, smart_binning_config=config)
    binner.run()
    print("📊 Smart‑binning complete: smart_bins_summary.csv, strategies.csv saved to", output_dir)
    # ─────────────────────────────────────────────────────────────────────────────




    
