import pandas as pd
import numpy as np
from src.components.data_ingestion import DataIngestion
from src.components.data_transformation import DataTransformation
from src.entity.config import DataIngestionConfig, TrainingConfig, DataTransformationConfig
from datetime import datetime


if __name__ == '__main__':
    training_config = TrainingConfig(datetime.now())
    data_ingestion_config = DataIngestionConfig(training_config)
    data_ingestion = DataIngestion(data_ingestion_config)
    data_ingestion_artifact = data_ingestion.initiate_data_ingestion()

    data_transformation_config = DataTransformationConfig(training_config)
    data_tansformation = DataTransformation(data_ingestion_artifact, data_transformation_config)
    data_transformation_artifact = data_tansformation.initiate_data_transformation()

