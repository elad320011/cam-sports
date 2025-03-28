from flask import request, jsonify
import os
import json
from datetime import datetime
from services.ai_advior import get_response
from controllers.game_statistics import get_game_statistics_by_id
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
    else:
        return jsonify({"error": "Invalid conversation message type"}), 400

    history.append({"role": "user", "content": message})
    history.append({"role": "assistant", "content": response})

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


# from flask import request, jsonify
# import os
# import json
# from services.ai_advior import get_response
# from controllers.game_statistics import get_game_statistics_by_id

# # TEMPORARY - for production we will use a database
# conversation_history = [{"role": "system", "content": os.getenv("OPENAI_STATISTICS_OVERVIEW_ROLE")}]

# # Load the conversation history
# def load_conv_history():
#     global conversation_history  # Access from memory- TEMPORARY

#     return jsonify({"conversation_history": conversation_history})

# # Send a message to the AI advisor
# def message_ai_advisor():
#     global conversation_history  # Access from memory- TEMPORARY
    
#     conv_message_type = request.json.get("type")
#     message = request.json.get("message")
    
#     if not conv_message_type:
#         return jsonify({"error": "No conversation message type provided"}), 400
    
#     if not message:
#         return jsonify({"error": "No message provided"}), 400

#     # Detect message type and get appropriate response
#     response = ""
#     if conv_message_type == "text":
#         response = get_response(conversation_history, message)
#     elif conv_message_type == "statistic_doc_id":
#         game_statistics_response, status_code = get_game_statistics_by_id(message)
#         if status_code == 200:
#             game_statistics_json = game_statistics_response.get_json()
#             game_statistics = json.dumps(game_statistics_json)
 
#             response = get_response(conversation_history, game_statistics)
#         else:
#             return game_statistics_response
#     else:
#         return jsonify({"error": "Invalid conversation message type"}), 400

#     return jsonify({"message": response})

# # Customize the AI advisor
# def customize_ai_advisor():
#     global conversation_history  # Access from memory- TEMPORARY
    
#     submitted_text = request.json.get("custom_info")
#     if not submitted_text:
#         return jsonify({"error": "No message provided"}), 400

#     # Add the new system message
#     conversation_history.append({"role": "system", "content": submitted_text})

#     return jsonify({"success": True, "message": "System message added successfully"}), 200
