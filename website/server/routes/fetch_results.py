from flask import Blueprint, request, jsonify
from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

fetch_results_bp = Blueprint('fetch_results_bp', __name__)

@fetch_results_bp.route('/fetch-results', methods=['GET'])
def fetch_table_data():
    try:
        mongo_uri = os.getenv("MONGODB_URI")
        client = MongoClient(mongo_uri)
        db = client["aioverstock"]
        collection = db["predicted_sales"]  # ⬅️ Use new collection where predictions are stored

        skip = int(request.args.get('skip', 0))
        limit = int(request.args.get('limit', 50))

        # Fetch documents from MongoDB
        data_cursor = collection.find().skip(skip).limit(limit)
        data = list(data_cursor)

        # Remove _id (ObjectId) before sending
        for row in data:
            row.pop('_id', None)

        return jsonify({
            "status": "success",
            "data": data
        })

    except Exception as e:
        print(f"❌ Fetch error: {e}")
        return jsonify({
            "status": "error",
            "error": str(e)
        }), 500
