from flask import Blueprint, request, jsonify
from controllers.input_controller import store_input, get_all_inputs

input_bp = Blueprint('input_bp', __name__)

@input_bp.route('/submit-input', methods=['POST'])
def submit_input():
    data = request.json
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    inserted_id = store_input(data)
    return jsonify({'message': 'Stored', 'id': inserted_id}), 200

@input_bp.route('/get-inputs', methods=['GET'])
def fetch_inputs():
    inputs = get_all_inputs()
    return jsonify(inputs)
