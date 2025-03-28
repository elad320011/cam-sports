import mongoengine as me
from datetime import datetime

class Conversation(me.Document):
    meta = {'collection': 'conversations'}
    email = me.StringField(required=True, unique=True)  # Use email as the identifier
    user_type = me.StringField(required=True, choices=['player', 'management'])
    history = me.ListField(me.DictField(), default=[])
    last_updated = me.DateTimeField(default=datetime.utcnow)
