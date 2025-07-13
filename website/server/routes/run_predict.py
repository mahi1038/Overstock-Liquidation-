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
        print("🚀 Starting run-prediction route...")

        # 1️⃣ Step: Run training pipeline via main.py
        script_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../main.py'))
        print(f"📍 Training script path: {script_path}")

        if not os.path.exists(script_path):
            print("❌ main.py not found.")
            return jsonify({"status": "error", "error": f"Script not found at {script_path}"}), 404

        print("🔧 Running training pipeline...")
        result = subprocess.run([sys.executable, script_path], capture_output=True, text=True)
        print("✅ Training script executed.")

        if result.returncode != 0:
            print(f"❌ Error in training: {result.stderr}")
            return jsonify({"status": "error", "error": result.stderr}), 500

        stdout_lines = result.stdout.strip().split("\n")
        print("📜 Full stdout:")
        for line in stdout_lines:
            print(line)

        metric_lines = [line for line in stdout_lines if any(m in line for m in ['RMSLE', 'SMAPE'])]
        print(f"📊 Extracted Metrics: {metric_lines}")
        # 2️⃣ Step: Fetch latest input from MongoDB
        print("📡 Connecting to MongoDB...")
        
        mongo_uri = os.getenv("MONGODB_URI")
        client = MongoClient(mongo_uri)
        db = client["aioverstock"]
        collection = db["user_inputs"]

        latest_input = collection.find().sort([('_id', -1)]).limit(1)
        latest_data = list(latest_input)

        if not latest_data:
            print("❌ No data found in MongoDB.")
            return jsonify({"status": "error", "error": "No input data found in MongoDB"}), 404

        print("✅ Retrieved latest input from MongoDB.")
        input_df = pd.DataFrame([latest_data[0]])
        input_df.drop(columns=["_id"], inplace=True, errors="ignore")
        print("📄 Input DataFrame:")
        print(input_df)

        # 3️⃣ Step: Load preprocessor.pkl

        # 1️⃣ Get the absolute path to the artifacts folder
        base_artifacts_dir = os.path.abspath("artifacts")

        # 2️⃣ Find all timestamped artifact folders inside /artifacts
        runs = sorted(
        [f.path for f in os.scandir(base_artifacts_dir) if f.is_dir()],
         reverse=True
        )

        if not runs:
         raise FileNotFoundError("❌ No artifact folders found in artifacts/ directory.")

        # 3️⃣ Use the most recent run
        latest_run_dir = runs[0]
        print(f"📁 Latest artifact run directory: {latest_run_dir}")

         # 4️⃣ Construct full paths from this folder
        preprocessor_path = os.path.join(latest_run_dir, "data_tranformed", "preprocessor", "preprocessro.pkl")
        model_path = os.path.join(latest_run_dir,"model_trainer", "model.pkl")

        print(f"🧪 Loading preprocessor from: {preprocessor_path}")
        print(f"🤖 Loading model from: {model_path}")

        print(f"🧪 Loading preprocessor from {preprocessor_path}")
        if not os.path.exists(preprocessor_path):
            print("❌ Preprocessor not found.")
            return jsonify({"status": "error", "error": f"Preprocessor not found at {preprocessor_path}"}), 500

        preprocessor = load(preprocessor_path)

        print("🔄 Transforming input data...")
        transformed_input = preprocessor.transform(input_df)
        transformed_input = transformed_input.astype(np.float32)
        print("✅ Input data transformed.")

        # 4️⃣ Step: Load model.pkl and predict
        print(f"🧠 Loading model from {model_path}")
        if not os.path.exists(model_path):
            print("❌ Model not found.")
            return jsonify({"status": "error", "error": f"Model not found at {model_path}"}), 500

        model = load(model_path)

        print("📈 Running prediction...")
        prediction_log = model.predict(transformed_input)
        prediction = np.expm1(prediction_log)[0]  # inverse log1p
        print(f"🎯 Prediction (actual scale): {prediction}")

        # 5️⃣ Return response
        print("✅ All steps completed. Returning result to frontend.")
        return jsonify({
            "status": "success",
            "metrics": metric_lines,
            "prediction": round(prediction, 2)
        })

    except Exception as e:
        print(f"❗ Exception occurred: {e}")
        return jsonify({"status": "error", "error": str(e)}), 500
