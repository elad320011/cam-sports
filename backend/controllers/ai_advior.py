from flask import request, jsonify
import os
from services.ai_advior import get_response

# TEMPORARY - for production we will use a database
conversation_history = [{"role": "system", "content": os.getenv("OPENAI_ROLE")}]

# Load the conversation history
def load_conv_history():
    global conversation_history  # Access from memory- TEMPORARY

    return jsonify({"conversation_history": conversation_history})

# Send a message to the AI advisor
def message_ai_advisor():
    global conversation_history  # Access from memory- TEMPORARY
    
    submitted_text = request.json.get("message")
    if not submitted_text:
        return jsonify({"error": "No message provided"}), 400

    answer = get_response(conversation_history, submitted_text)

    return jsonify({"message": answer})

# Customize the AI advisor
def customize_ai_advisor():
    global conversation_history  # Access from memory- TEMPORARY
    
    submitted_text = request.json.get("custom_info")
    if not submitted_text:
        return jsonify({"error": "No message provided"}), 400

    # Add the new system message
    conversation_history.append({"role": "system", "content": submitted_text})

    return jsonify({"success": True, "message": "System message added successfully"}), 200
