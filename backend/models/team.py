import mongoengine as me
import os

# Load environment variables
MONGODB_URI = os.getenv('MONGODB_URI')

me.connect(host = MONGODB_URI)


class Team(me.Document):
    meta = {
        'collection': 'teams',
        'indexes': [
            'name',  # Index on team name
            'code'   # Index on code
        ]
    }
    name = me.StringField(required=True, unique=True)
    code = me.StringField(required=True, unique=True)
    players = me.ListField(me.StringField(), default=[])  # Now stores player emails
    management = me.ListField(me.StringField(), default=[])    # Now stores management emails
    payment_method = me.StringField()
