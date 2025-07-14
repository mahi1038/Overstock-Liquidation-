from flask import Flask
from flask_cors import CORS
from routes.input_routes import input_bp
from routes.run_predict import run_prediction_bp
from routes.fetch_table_data import fetch_data_bp
from routes.train_model import train_model_bp
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# ✅ Correct CORS setup for handling preflight OPTIONS requests
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

app.register_blueprint(input_bp)
app.register_blueprint(run_prediction_bp)
app.register_blueprint(fetch_data_bp)
app.register_blueprint(train_model_bp)
if __name__ == '__main__':
   app.run(debug=True, port=5050)

