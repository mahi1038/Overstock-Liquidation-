import os
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()  # load .env file

mongo_uri = os.getenv("MONGODB_URI")
client = MongoClient(mongo_uri)
db = client.get_default_database()  # will use 'overstockDB' from URI
