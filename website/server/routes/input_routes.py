from flask import Blueprint, request, jsonify
from pymongo import MongoClient
from datetime import datetime, timedelta
from controllers.input_controller import store_input, get_all_inputs
from datetime import datetime
import math
from config.mongodb import db,sales_collection
from utils.feature import compute_features_from_mongo  
input_bp = Blueprint('input_bp', __name__)

def get_week_of_month(date):
    first_day = date.replace(day=1)
    adjusted_dom = date.day + first_day.weekday()
    return int((adjusted_dom - 1) / 7) + 1

def derive_department_id(item_id):
    # Extract everything before the last underscore
    parts = item_id.split('_')
    if len(parts) >= 2:
        return '_'.join(parts[:-1])  # "FOODS_1_001" → "FOODS_1"
    return item_id  # fallback

def derive_state_id(store_id):
    # Extract everything before the underscore
    return store_id.split('_')[0]  # "TX_3" → "TX"


@input_bp.route('/submit-input', methods=['POST'])
def submit_input():
    data = request.json
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    required_fields = ['item_id', 'store_id', 'snap', 'sell_price',
                       'event_name_1', 'event_type_1', 'event_name_2', 'event_type_2']

    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing field: {field}'}), 400


    # 1. Get latest date from sales_data
    latest_doc = sales_collection.find_one(sort=[("date", -1)])
    if not latest_doc or "date" not in latest_doc:
     raise Exception("No sales data with valid date found.")

    # 2. Parse and increment the date
    latest_date_str = latest_doc["date"]  # e.g., '2024-03-28'
    latest_date = (
      datetime.strptime(latest_date_str, "%Y-%m-%d") if isinstance(latest_date_str, str) else latest_date_str
    )
    now= latest_date + timedelta(days=1)
 
    features = compute_features_from_mongo(data['item_id'], data['store_id'], now)
    structured_data = {
    "item_id": data['item_id'],
    "dept_id": derive_department_id(data['item_id']),   # renamed
    "store_id": data['store_id'],
    "state_id": derive_state_id(data['store_id']),
    "weekday": now.strftime('%A'),
    "month": now.month,
    "week_of_month": get_week_of_month(now),
    "event_name_1": data['event_name_1'],
    "event_type_1": data['event_type_1'],
    "event_name_2": data['event_name_2'],
    "event_type_2": data['event_type_2'],
    "snap_active": 1 if data['snap'].lower() == "yes" else 0,
    "sell_price": float(data['sell_price']),
    "lag_28": features["lag_28"],
    "lag_7": features["lag_7"],
    "rolling_mean_28": features["rolling_mean_28"],
    "zero_streak": features["zero_streak"],
    "price_pct_change": features["price_pct_change"],
    "created_at": now.isoformat()
    }


    inserted_id = store_input(structured_data)
    return jsonify({'message': 'Stored', 'id': str(inserted_id)}), 200

@input_bp.route('/get-inputs', methods=['GET'])
def fetch_inputs():
    inputs = get_all_inputs()
    return jsonify(inputs)
