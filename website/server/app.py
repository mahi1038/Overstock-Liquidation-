from flask import Flask
from routes.input_routes import input_bp
from flask_cors import CORS
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Register blueprints
app.register_blueprint(input_bp)

if __name__ == '__main__':
    app.run(debug=True)
