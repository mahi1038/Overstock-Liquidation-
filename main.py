import pandas as pd
import numpy as np
from src.components.data_ingestion import DataIngestion
from src.components.data_transformation import DataTransformation
from src.components.model_trainer import ModelTrainer
from src.entity.config import DataIngestionConfig, TrainingConfig, DataTransformationConfig, ModelTrainerConfig
from datetime import datetime

if __name__ == '__main__':
    print("✅ Starting training pipeline")

    training_config = TrainingConfig(datetime.now())
    print("📦 Training config created")

    data_ingestion_config = DataIngestionConfig(training_config)
    data_ingestion = DataIngestion(data_ingestion_config)
    data_ingestion_artifact = data_ingestion.initiate_data_ingestion()
    print("📥 Data ingestion complete")

    data_transformation_config = DataTransformationConfig(training_config)
    data_transformation = DataTransformation(data_ingestion_artifact, data_transformation_config)
    data_transformation_artifact = data_transformation.initiate_data_transformation()
    print("🔄 Data transformation complete")

    model_trainer_config = ModelTrainerConfig(training_config)
    model_trainer = ModelTrainer(data_transformation_artifact, model_trainer_config)
    model_trainer_artifact = model_trainer.initiate_model_training()
    print("🤖 Model training complete")

    print("📊 Metrics:")
    print("Test RMSLE:", model_trainer_artifact.test_metrics.rmsle_value)
    print("Test SMAPE:", model_trainer_artifact.test_metrics.smape_value)
    print("Train RMSLE:", model_trainer_artifact.train_metrics.rmsle_value)
    print("Train SMAPE:", model_trainer_artifact.train_metrics.smape_value)
