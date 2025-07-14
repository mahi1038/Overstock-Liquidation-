import os
import sys

# ✅ Step 0: Add root dir to sys.path before anything else
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../"))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

print("🧭 sys.path (patched):")
for p in sys.path:
    print("  ", p)


from flask import Blueprint, jsonify
import subprocess
import pandas as pd
import glob
import numpy as np
from pymongo import MongoClient
from joblib import load
from dotenv import load_dotenv
import json

load_dotenv()

run_prediction_bp = Blueprint('run_prediction_bp', __name__)

@run_prediction_bp.route('/run-prediction', methods=['POST'])
def run_prediction():
    try:
        print("📡 Connecting to MongoDB...")

        mongo_uri = os.getenv("MONGODB_URI")
        client = MongoClient(mongo_uri)
        db = client["aioverstock"]
        collection = db["sales_data"]

        # ✅ Step 1: Fetch all records
        data_cursor = collection.find()
        raw_data = list(data_cursor)

        if not raw_data:
            return jsonify({"status": "error", "error": "No data found in MongoDB"}), 404

        print(f"📄 Fetched {len(raw_data)} records")

        # ✅ Step 2: Convert to DataFrame and clean
        df = pd.DataFrame(raw_data)
        df.drop(columns=["_id", "sales", "sales_28_sum", "date"], inplace=True, errors="ignore")

        # ✅ Step 3: Filter only required features for model
        required_features = [
            "item_id", "dept_id", "store_id", "state_id", "weekday", "month", "week_of_month",
            "event_name_1", "event_type_1", "event_name_2", "event_type_2",
            "snap_active", "sell_price", "lag_28", "lag_7", "rolling_mean_28",
            "price_pct_change", "zero_streak"
        ]
        df = df[required_features]

        print("📦 Cleaned input shape:", df.shape)

        # ✅ Step 4: Load Preprocessor & Model
        base_artifacts_dir = os.path.abspath("artifacts")
        runs = sorted(
            [f.path for f in os.scandir(base_artifacts_dir) if f.is_dir()],
            reverse=True
        )
        if not runs:
            raise FileNotFoundError("❌ No artifact folders found.")

        latest_run_dir = runs[0]
        preprocessor_path = os.path.join(latest_run_dir, "data_tranformed", "preprocessor", "preprocessro.pkl")
        model_path = os.path.join(latest_run_dir, "model_trainer", "model.pkl")

        print("🧪 Loading preprocessor:", preprocessor_path)
        preprocessor = load(preprocessor_path)

        print("🤖 Loading model:", model_path)
        model = load(model_path)

        # ✅ Step 5: Transform and Predict
        print("🔄 Transforming data...")
        transformed = preprocessor.transform(df).astype(np.float32)

        print("📈 Running predictions...")
        predictions_log = model.predict(transformed)
        predictions = np.expm1(predictions_log)  # inverse of log1p

        # ✅ Step 6: Return result
        results = predictions.round(2).tolist()
        print("🎯 Predictions generated")

        # Let's say you want to return 3 columns only:
        # ✅ Step 6: Return result
        output_df = df[['item_id', 'store_id']].copy()
        output_df['predicted_sales'] = predictions.round(2)

        result = output_df.to_dict(orient="records")

        return jsonify({
  "status": "success",
  "data": result
})



    except Exception as e:
        print(f"❗ Exception: {e}")
        return jsonify({"status": "error", "error": str(e)}), 500
