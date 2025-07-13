import os
from dotenv import load_dotenv
from pymongo import MongoClient

# ✅ Load environment variables
load_dotenv()

# ✅ Get the MongoDB URI from .env
mongo_uri = os.getenv("MONGODB_URI")

if not mongo_uri:
    raise Exception("❌ MONGODB_URI not found in .env file!")

print(f"📡 Connecting to MongoDB at: {mongo_uri}")

# ✅ Create the client
client = MongoClient(mongo_uri)

# ✅ Select database and collection
db = client["aioverstock"]
sales_collection = db["sales_data"]

# ✅ Try a sample query to verify
try:
    print("🔍 Checking connection and sample data...")
    doc = sales_collection.find_one()
    if doc:
        print("✅ Connection successful! Sample document:")
        print(doc)
    else:
        print("⚠️ Connected, but no documents in sales_data collection.")
except Exception as e:
    print(f"❌ Connection failed: {e}")
