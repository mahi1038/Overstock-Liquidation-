from dotenv import load_dotenv
from pymongo import MongoClient
from data_pusher import DataPusher  # ✅ Update path to your class file
from src.constants import SALES_FILE_PATH, CALENDAR_FILE_PATH, PRICES_FILE_PATH
import os

load_dotenv()

# ✅ Initialize the DataPusher
pusher = DataPusher(
    sales_path=SALES_FILE_PATH,
    calendar_path=CALENDAR_FILE_PATH,
    prices_path=PRICES_FILE_PATH
)

# ✅ Get the final transformed DataFrame
df = pusher.get_evaluation_dataframe()
print(f"📦 Final DataFrame loaded: {df.shape[0]} rows, {df.shape[1]} columns")

# ✅ MongoDB Atlas connection
client = MongoClient(os.getenv("MONGO_URI"))
collection = client["aioverstock"]["sales_data"]

# ✅ Push in chunks
chunk_size = 10000
for i in range(0, len(df), chunk_size):
    chunk = df.iloc[i:i + chunk_size].to_dict("records")
    collection.insert_many(chunk)
    print(f"✅ Inserted chunk {i // chunk_size + 1}")
