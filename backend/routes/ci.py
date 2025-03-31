from flask import Blueprint, request
from controllers.ci import trigger_ci

ci_bp = Blueprint('training_plans', __name__)

@ci_bp.route('/trigger', methods=['POST'])
def trigger_ci():
    return trigger_ci(request)
