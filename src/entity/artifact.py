import os

class DataIngestionArtifact:
    def __init__(self, train_path, test_path):
        self.train_path = train_path
        self.test_path = test_path

class DataTransformationArtifact:
    def __init__(self, transformed_train_file_path, transformed_test_file_path, preprocessor_obj_file_path):
        self.transformed_train_file_path = transformed_train_file_path
        self.transformed_test_file_path = transformed_test_file_path
        self.preprocessor_obj_file_path = preprocessor_obj_file_path

    
        