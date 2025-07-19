from flask import Blueprint, request, jsonify
from pymongo import MongoClient
from dotenv import load_dotenv
import os
from flask import Response
import numpy as np
from bson.json_util import dumps
import math

load_dotenv()

fetch_results_bp = Blueprint('fetch_results_bp', __name__)

@fetch_results_bp.route('/fetch-results', methods=['GET'])
def fetch_results():
    try:
        mongo_uri = os.getenv("MONGODB_URI")
        client = MongoClient(mongo_uri)
        db = client["aioverstock"]
        collection = db["predicted_sales"]

        # Get skip value from query params
        skip = int(request.args.get("skip", 0))

        # Fields to include in the response
        projection = {
            "_id": 1,
            "date": 1,
            "item_id": 1,
            "store_id": 1,
            "sales_28_sum": 1,
            "predicted_sales": 1,
            "sell_price": 1,
            "price_pct_change": 1
        }

        data_cursor = collection.find({}, projection).sort("created_at", -1).skip(skip).limit(1000)
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