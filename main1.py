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

    input_path  = data_ingestion_artifact.train_path
    input_df = pd.read_csv(input_path)

    smart_binning_config = SmartBinningConfig(training_config)
    smart_binning = SmartBinning(input_df, smart_binning_config)
    smart_binning_artifact = smart_binning.run()
    print('smart binning completed')





    
