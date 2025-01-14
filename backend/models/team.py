import mongoengine as me
import os

# Load environment variables
MONGODB_URI = os.getenv('MONGODB_URI')

me.connect(host = MONGODB_URI)


class Team(me.Document):
    name = me.StringField(required=True)
    manager = me.StringField(required=True)
    staff = me.ListField(me.StringField())
    players = me.ListField(me.StringField())
    payment_method = me.StringField()
