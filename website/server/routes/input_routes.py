from flask import Blueprint, request, jsonify
from controllers.input_controller import store_input, get_all_inputs
from datetime import datetime
import calendar

input_bp = Blueprint('input_bp', __name__)

def get_week_of_month(date):
    first_day = date.replace(day=1)
    adjusted_dom = date.day + first_day.weekday()
    return int((adjusted_dom - 1) / 7) + 1

@input_bp.route('/submit-input', methods=['POST'])
def submit_input():
    data = request.json
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    now = datetime.now()

    # Auto-generated fields
    data['weekday'] = now.strftime('%A')               # e.g., "Thursday"
    data['month'] = now.strftime('%B')                 # e.g., "July"
    data['week_of_month'] = get_week_of_month(now)     # e.g., 1, 2, 3, ...
    data['event_name_1'] = None                        # placeholder
    data['event_type_1'] = None
    data['event_name_2'] = None
    data['event_type_2'] = None
    data['created_at'] = now.isoformat()               # Optional timestamp

    inserted_id = store_input(data)
    return jsonify({'message': 'Stored', 'id': inserted_id}), 200

@input_bp.route('/get-inputs', methods=['GET'])
def fetch_inputs():
    inputs = get_all_inputs()
    return jsonify(inputs)
