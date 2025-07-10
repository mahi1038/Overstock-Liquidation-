import os
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()  # load .env file

mongo_uri = os.getenv("MONGODB_URI")
client = MongoClient(mongo_uri)
db = client["aioverstock"]
sales_collection = db["sales_data"] # will use 'overstockDB' from URI
