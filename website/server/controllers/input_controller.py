from config.mongodb import db

def store_input(data):
    inputs_collection = db["user_inputs"]
    result = inputs_collection.insert_one(data)
    return str(result.inserted_id)

def get_all_inputs():
    inputs_collection = db["user_inputs"]
    return list(inputs_collection.find({}, {"_id": 0}))
