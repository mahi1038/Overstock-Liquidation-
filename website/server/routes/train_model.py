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

train_model_bp = Blueprint('train_model_bp', __name__)

@train_model_bp.route('/train-model', methods=['POST'])
@train_model_bp.route('/train-model', methods=['POST'])
def train_model():
    try:
        print("🚀 Starting run-prediction route...")

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

        # ✅ RETURN RESPONSE HERE
        return jsonify({
            "status": "success",
            "metrics": metric_lines
        })

    except Exception as e:
        print(f"❗ Exception occurred: {e}")
        return jsonify({"status": "error", "error": str(e)}), 500
