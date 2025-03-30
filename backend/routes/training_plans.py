from flask import Blueprint, request
from controllers.training_plans import create_training_plan, delete_training_plan, get_training_plan_by_team_id

training_plans_bp = Blueprint('training_plans', __name__)

@training_plans_bp.route('/create', methods=['POST'])
def create():
    return create_training_plan(request)

@training_plans_bp.route('/team_id/<team_id>', methods=['GET'])
def get_training_plan_by_team_id_route(team_id):
    return get_training_plan_by_team_id(team_id)

@training_plans_bp.route('/delete', methods=['DELETE'])
def delete_training_plan_route():
    data = request.get_json()
    team_id = data.get('team_id')
    plan_id = data.get('plan_id')
    return delete_training_plan(team_id, plan_id)
