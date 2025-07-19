from src import constants
from datetime import datetime
import os

class TrainingConfig:
    def __init__(self, timestamp = datetime.now()):
        self.timestamp = timestamp.strftime("%m_%d_%Y_%H_%M_%S")
        self.artifact_dir_name = constants.ARTIFACT_DIR_NAME
        self.artifact_dir_path = os.path.join(self.artifact_dir_name, self.timestamp)
        

class DataIngestionConfig:
    def __init__(self, training_pipeline_config: TrainingConfig):
        self.data_ingestion_dir_path = os.path.join(training_pipeline_config.artifact_dir_path, constants.DATA_INGESTION_DIR_NAME)
        self.train_path = os.path.join(self.data_ingestion_dir_path, constants.TRAIN_FILE_NAME)
        self.test_path = os.path.join(self.data_ingestion_dir_path, constants.TEST_FILE_NAME)
        self.train_test_ratio = constants.DATA_INGESTION_SPLIT_RATIO
        self.calendar_path = constants.CALENDAR_FILE_PATH
        self.sales_path = constants.SALES_FILE_PATH
        self.prices_path = constants.PRICES_FILE_PATH

class DataTransformationConfig:
    def __init__(self, training_pipeline_config: TrainingConfig):
        self.data_transformation_dir_path = os.path.join(training_pipeline_config.artifact_dir_path, constants.DATA_TRANSFORMATION_DIR_NAME)
        self.transformed_train_path = os.path.join(self.data_transformation_dir_path, constants.TRAIN_FILE_NAME.replace('csv', 'npz'))
        self.transformed_test_path = os.path.join(self.data_transformation_dir_path, constants.TEST_FILE_NAME.replace('csv', 'npz'))
        self.preprocessor_obj_file_path = os.path.join(self.data_transformation_dir_path, constants.PREPROCESSOR_DIR_NAME, constants.PREPROCESSOR_OBJECT_FILE_NAME)
        self.feature_name_file_path = os.path.join(self.data_transformation_dir_path, constants.DATA_TRANSFORMATION_FEATURE_NAME_FILE)
        self.target_column = constants.TARGET_COLUMNS


class ModelTrainerConfig:
  def __init__(self, training_pipeline_config: TrainingConfig):
    self.model_trainer_dir = os.path.join(training_pipeline_config.artifact_dir_path, constants.MODEL_TRAINER_DIR_NAME)
    self.model_file_path = os.path.join(self.model_trainer_dir, constants.MODEL_TRAINER_BEST_MODEL_FILE_NAME)
    self.trained_y = os.path.join(self.model_trainer_dir, constants.PREDICTED_TRAIN)

class SmartBinningConfig:
    def __init__(self, training_pipeline_config: TrainingConfig):
        self.smart_binning_dir = os.path.join(training_pipeline_config.artifact_dir_path, constants.SMART_BINNING_DIR_NAME)
        self.smart_binning_output_filepath = os.path.join(self.smart_binning_dir, constants.SMART_BINNING_OUTPUT_FILE_NAME)



   

