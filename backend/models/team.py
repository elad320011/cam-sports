import mongoengine as me
import os

# Load environment variables
MONGODB_URI = os.getenv('MONGODB_URI')

me.connect(host = MONGODB_URI)


class Team(me.Document):
    meta = {
        'collection': 'teams',
        'indexes': [
            'team_id',  # Index on team_id
            'code'      # Index on code
        ]
    }
    team_id = me.StringField(required=True, unique=True)
    code = me.StringField(required=True, unique=True)  # Add this new field for the random code
    players = me.ListField(me.StringField(), default=[])  # Now stores player emails
    management = me.ListField(me.StringField(), default=[])    # Now stores management emails
    payment_method = me.StringField()
