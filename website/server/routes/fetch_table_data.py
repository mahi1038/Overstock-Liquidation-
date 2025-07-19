from flask import Blueprint, jsonify, request
from pymongo import MongoClient
from dotenv import load_dotenv
import os
import numpy as np

load_dotenv()

fetch_data_bp = Blueprint('fetch_data_bp', __name__)

@fetch_data_bp.route('/fetch-table-data', methods=['GET'])
def fetch_table_data():
    try:
        mongo_uri = os.getenv("MONGODB_URI")
        client = MongoClient(mongo_uri)
        db = client["aioverstock"]
        collection = db["sales_data"]

        # Get skip value from query params
        skip = int(request.args.get("skip", 0))

        data_cursor = collection.find().sort("created_at", -1).skip(skip).limit(1000)
        data = []

        def clean(doc):
            doc["_id"] = str(doc["_id"])
            for k, v in doc.items():
                if isinstance(v, float) and (np.isnan(v) or np.isinf(v)):
                    doc[k] = None
            return doc

        for doc in data_cursor:
            data.append(clean(doc))

        return jsonify({"status": "success", "data": data})

    except Exception as e:
        return jsonify({"status": "error", "error": str(e)}), 500
