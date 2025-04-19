import mongoengine as me
import os

MONGODB_URI = os.getenv('MONGODB_URI')
me.connect(host=MONGODB_URI)

class Role(me.Document):
    meta = {'collection': 'roles'}
    player_id = me.ReferenceField('Player')  # Make player_id optional by removing required=True
    instructions = me.StringField()  # Instructions for the role
