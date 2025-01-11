from flask import Blueprint
from controllers.ai_advior import message_ai_advisor, customize_ai_advisor, load_conv_history

ai_advior_bp = Blueprint('ai_advior', __name__)


@ai_advior_bp.route("/load_conv_history", methods=['GET'])
def load_conv_history_route():
    return load_conv_history()

@ai_advior_bp.route("/message_ai_advisor", methods=['GET', 'POST'])
def message_ai_advisor_route():
    return message_ai_advisor()


@ai_advior_bp.route("/customize_ai_advisor", methods=['POST'])
def customize_ai_advisor_route():
    return customize_ai_advisor()
