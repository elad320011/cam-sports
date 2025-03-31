from flask import Blueprint, request
from controllers.ci import trigger_ci

ci_bp = Blueprint('ci_bp', __name__)

@ci_bp.route('/trigger', methods=['POST'])
def trigger_ci_route():
    return trigger_ci(request)
