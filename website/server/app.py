from flask import Flask
from flask_cors import CORS
from routes.input_routes import input_bp
from routes.run_predict import run_prediction_bp
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# ✅ Correct CORS setup for handling preflight OPTIONS requests
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

app.register_blueprint(input_bp)
app.register_blueprint(run_prediction_bp)
if __name__ == '__main__':
   app.run(debug=True, port=5050)

