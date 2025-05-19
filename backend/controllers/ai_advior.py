from flask import request, jsonify
import os
import json
from datetime import datetime
from services.ai_advior import get_response
from controllers.game_statistics import get_game_statistics_by_id
from controllers.training_plans import get_training_plan_by_id
from models.conversation import Conversation

def load_conv_history():
    email = request.args.get('email')
    user_type = request.args.get('user_type')

    if not email or not user_type:
        return jsonify({"error": "Missing email or user_type parameter"}), 400

    conversation = Conversation.objects(email=email, user_type=user_type).first()
    if conversation:
        return jsonify({"conversation_history": conversation.history}), 200
    else:
        return jsonify({"conversation_history": []}), 200

def message_ai_advisor():
    email = request.json.get('email')
    user_type = request.json.get('user_type')
    conv_message_type = request.json.get("type")
    message = request.json.get("message")
    is_temp = request.json.get("isTemp", False)
    
    if not all([email, user_type, conv_message_type, message]):
        return jsonify({"error": "Missing required fields"}), 400

    conversation = Conversation.objects(email=email, user_type=user_type).first()
    if not conversation:
        conversation = Conversation(email=email, user_type=user_type, history=[
            {"role": "system", "content": os.getenv("OPENAI_STATISTICS_OVERVIEW_ROLE")}
        ])
        conversation.save()

    history = conversation.history.copy()

    if conv_message_type == "text":
        response = get_response(history, message)
    elif conv_message_type == "statistic_doc_id":
        game_statistics_response, status_code = get_game_statistics_by_id(message)
        if status_code == 200:
            game_statistics_json = game_statistics_response.get_json()
            game_statistics = json.dumps(game_statistics_json)
            response = get_response(history, game_statistics)
        else:
            return game_statistics_response
    elif conv_message_type == "training_plan_id":
        training_plan_response, status_code = get_training_plan_by_id(message)
        if status_code == 200:
            training_plan_json = training_plan_response.get_json()
            training_plan = json.dumps(training_plan_json)
            response = get_response(history, training_plan)
        else:
            return training_plan_response
    else:
        return jsonify({"error": "Invalid conversation message type"}), 400

    # Add user message
    message_obj = {"role": "user", "content": message}
    if is_temp:
        message_obj["isTemp"] = True
    history.append(message_obj)

    # Add assistant message
    message_obj = {"role": "assistant", "content": response}
    if is_temp:
        message_obj["isTemp"] = True
    history.append(message_obj)

    conversation.history = history
    conversation.last_updated = datetime.utcnow()
    conversation.save()

    return jsonify({"message": response}), 200

def customize_ai_advisor():
    email = request.json.get('email')
    user_type = request.json.get('user_type')
    submitted_text = request.json.get("custom_info")

    if not all([email, user_type, submitted_text]):
        return jsonify({"error": "Missing required fields"}), 400

    conversation = Conversation.objects(email=email, user_type=user_type).first()
    if not conversation:
        conversation = Conversation(email=email, user_type=user_type)

    conversation.history.append({"role": "system", "content": submitted_text})
    conversation.last_updated = datetime.utcnow()
    conversation.save()

    return jsonify({"success": True, "message": "System message added successfully"}), 200

def clean_temp_messages():
    email = request.json.get('email')
    user_type = request.json.get('user_type')

    if not all([email, user_type]):
        return jsonify({"error": "Missing required fields"}), 400

    conversation = Conversation.objects(email=email, user_type=user_type).first()
    if not conversation:
        return jsonify({"error": "Conversation not found"}), 404

    # Filter out messages that have isTemp flag
    conversation.history = [msg for msg in conversation.history if not msg.get('isTemp')]
    conversation.last_updated = datetime.utcnow()
    conversation.save()

    return jsonify({"success": True, "message": "Temporary messages cleaned successfully"}), 200
