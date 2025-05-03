from flask import Blueprint, request, jsonify
from controllers.message_board_controller import MessageBoardController

message_board_bp = Blueprint('message_board', __name__)

# Create a message board for a team
@message_board_bp.route('/', methods=['POST'])
def create_message_board():
    try:
        data = request.get_json()
        team_id = data.get('team_id')
        
        if not team_id:
            return jsonify({'error': 'Team ID is required'}), 400
            
        message_board = MessageBoardController.create_message_board(team_id)
        return jsonify({
            'message': 'Message board created successfully',
            'message_board_id': str(message_board.id)
        }), 201
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Get message board for a team
@message_board_bp.route('/<team_id>', methods=['GET'])
def get_message_board(team_id):
    try:
        message_board = MessageBoardController.get_message_board(team_id)
        return jsonify({
            'message_board_id': str(message_board.id),
            'team_id': str(message_board.team_id),
            'messages': [
                {
                    'content': msg.content,
                    'type': msg.type,
                    'creator_email': msg.creator_email,
                    'created_at': msg.created_at.isoformat(),
                    'last_updated': msg.last_updated.isoformat()
                } for msg in message_board.messages
            ]
        }), 200
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Add a message to the board
@message_board_bp.route('/<team_id>/messages', methods=['POST'])
def add_message(team_id):
    try:
        data = request.get_json()
        content = data.get('content')
        message_type = data.get('type')
        creator_email = data.get('creator_email')
        
        message_board = MessageBoardController.add_message(
            team_id, content, message_type, creator_email
        )
        
        return jsonify({
            'message': 'Message added successfully',
            'message_board_id': str(message_board.id)
        }), 201
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Update a message
@message_board_bp.route('/<team_id>/messages/<int:message_index>', methods=['PUT'])
def update_message(team_id, message_index):
    try:
        data = request.get_json()
        content = data.get('content')
        message_type = data.get('type')
        
        message_board = MessageBoardController.update_message(
            team_id, message_index, content, message_type
        )
        
        return jsonify({'message': 'Message updated successfully'}), 200
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Delete a message
@message_board_bp.route('/<team_id>/messages/<int:message_index>', methods=['DELETE'])
def delete_message(team_id, message_index):
    try:
        MessageBoardController.delete_message(team_id, message_index)
        return jsonify({'message': 'Message deleted successfully'}), 200
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Delete a message board
@message_board_bp.route('/<team_id>', methods=['DELETE'])
def delete_message_board(team_id):
    try:
        MessageBoardController.delete_message_board(team_id)
        return jsonify({'message': 'Message board deleted successfully'}), 200
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500 