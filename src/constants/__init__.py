import os

"""
Training variables
"""
ARTIFACT_DIR_NAME = 'artifacts'
CALENDAR_FILE_PATH = r"E:\environments\wallmart_hackathon\dataset\m5-forecasting-accuracy\calendar.csv"
SALES_FILE_PATH = r'E:\environments\wallmart_hackathon\dataset\m5-forecasting-accuracy\sales_train_validation.csv'
PRICES_FILE_PATH =r"E:\environments\wallmart_hackathon\dataset\m5-forecasting-accuracy\sell_prices.csv"
TRAIN_FILE_NAME = 'train.csv'
TEST_FILE_NAME = 'test.csv'
TARGET_COLUMNS = 'sales_28_sum'

"""
Data Ingestion variable
"""
DATA_INGESTION_SPLIT_RATIO = 0.2
DATA_INGESTION_DIR_NAME = 'data_ingested'

"""
Data Transformation variables
"""
DATA_TRANSFORMATION_DIR_NAME = 'data_tranformed'
DATA_TRANSFORMATION_OBJ_DIR_NAME = 'transformed_object'
PREPROCESSOR_DIR_NAME = 'preprocessor'
PREPROCESSOR_OBJECT_FILE_NAME = 'preprocessro.pkl'
DATA_TRANSFORMATION_FEATURE_NAME_FILE = 'features.npy'


"""
Model Trainer variables
"""

MODEL_TRAINER_DIR_NAME = 'model_trainer'
MODEL_TRAINER_BEST_MODEL_FILE_NAME = 'model.pkl'
MODEL_TRAINER_SB_DATAFRAME_FILE_NAME = 'sb_dataframe.csv'
PREDICTED_TRAIN =   'predicted.csv'
SMART_BINNING_DATAFRAME = 'smart_binning_daframe'


"""
smart binning variable
"""

SMART_BINNING_DIR_NAME = 'smart_binning'
SMART_BINNING_SMART_BINS_FILE_NAME = 'smart_bins.csv'
SMART_BINNING_SUMMARY_FILE_NAME = 'smart_bins_summary.csv'
SMART_BINNING_STRATEGIES_FILE_NAME = 'strategies.csv'
