from bson import ObjectId
from datetime import datetime
from models.message_board import MessageBoard, Message

class MessageBoardController:
    @staticmethod
    def create_message_board(team_id):
        # Check if message board already exists for this team
        existing_board = MessageBoard.objects(team_id=team_id).first()
        if existing_board:
            raise ValueError('Message board already exists for this team')
            
        message_board = MessageBoard(team_id=team_id)
        message_board.save()
        return message_board

    @staticmethod
    def get_message_board(team_id):
        message_board = MessageBoard.objects(team_id=team_id).first()
        if not message_board:
            raise ValueError('Message board not found')
        return message_board

    @staticmethod
    def add_message(team_id, content, message_type, creator_email):
        if not all([content, message_type, creator_email]):
            raise ValueError('Content, type, and creator_email are required')

        message_board = MessageBoard.objects(team_id=team_id).first()  # team_id is the team name
        if not message_board:
            raise ValueError('Message board not found')
            
        new_message = Message(
            content=content,
            type=message_type,
            creator_email=creator_email
        )
        
        message_board.messages.append(new_message)
        message_board.last_updated = datetime.utcnow()
        message_board.save()
        return message_board

    @staticmethod
    def update_message(team_id, message_index, content=None, message_type=None):
        if not content and not message_type:
            raise ValueError('At least one field to update is required')
            
        message_board = MessageBoard.objects(team_id=team_id).first()
        if not message_board:
            raise ValueError('Message board not found')
            
        if message_index >= len(message_board.messages):
            raise ValueError('Message not found')
            
        message = message_board.messages[message_index]
        if content:
            message.content = content
        if message_type:
            message.type = message_type
            
        message.last_updated = datetime.utcnow()
        message_board.last_updated = datetime.utcnow()
        message_board.save()
        return message_board

    @staticmethod
    def delete_message(team_id, message_index):
        message_board = MessageBoard.objects(team_id=team_id).first()
        if not message_board:
            raise ValueError('Message board not found')
            
        if message_index >= len(message_board.messages):
            raise ValueError('Message not found')
            
        message_board.messages.pop(message_index)
        message_board.last_updated = datetime.utcnow()
        message_board.save()
        return message_board

    @staticmethod
    def delete_message_board(team_id):
        message_board = MessageBoard.objects(team_id=team_id).first()
        if not message_board:
            raise ValueError('Message board not found')
            
        message_board.delete()
        return True 