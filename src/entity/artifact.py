import os

class DataIngestionArtifact:
    def __init__(self, train_path, test_path):
        self.train_path = train_path
        self.test_path = test_path

class DataTransformationArtifact:
    def __init__(self, transformed_train_file_path, transformed_test_file_path, preprocessor_obj_file_path, feature_file_path):
        self.transformed_train_file_path = transformed_train_file_path
        self.transformed_test_file_path = transformed_test_file_path
        self.preprocessor_obj_file_path = preprocessor_obj_file_path
        self.feature_name_file_path = feature_file_path

class ClassificationMetric:
    def __init__(self, rmsle_value, smape_value):
        self.rmsle_value = rmsle_value
        self.smape_value = smape_value

class ModelTrainerArtifact:
    def __init__(self, trained_model_file_path, train_metrics, test_metrics, predicted_path):
        self.trained_model_file_path = trained_model_file_path
        self.train_metrics = train_metrics
        self.test_metrics = test_metrics
        self.predicted_path = predicted_path

class SmartBinningArtifact:
    def __init__(self, smart_binning_output_file_path, summary_dataframe):
        self.smart_binning_output_file_path = smart_binning_output_file_path
        self.summary_dataframe = summary_dataframe

    
        