import mongoengine as me
import os
from datetime import datetime

MONGODB_URI = os.getenv('MONGODB_URI')
me.connect(host=MONGODB_URI)

class Message(me.EmbeddedDocument):
    content = me.StringField(required=True)
    type = me.StringField(required=True)
    creator_email = me.StringField(required=True)
    created_at = me.DateTimeField(default=datetime.utcnow)
    last_updated = me.DateTimeField(default=datetime.utcnow)

class MessageBoard(me.Document):
    meta = {
        'collection': 'message_boards',
        'indexes': ['team_id']
    }
    team_id = me.StringField(required=True, unique=True)
    created_at = me.DateTimeField(default=datetime.utcnow)
    last_updated = me.DateTimeField(default=datetime.utcnow)
    messages = me.ListField(me.EmbeddedDocumentField(Message), default=[])