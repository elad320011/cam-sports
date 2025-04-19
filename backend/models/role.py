import mongoengine as me
import os

MONGODB_URI = os.getenv('MONGODB_URI')
me.connect(host=MONGODB_URI)

class Role(me.Document):
    meta = {'collection': 'roles'}
    player_id = me.ReferenceField('Player', required=True)  # Reference to the Player model
    instructions = me.StringField()  # Instructions for the role
