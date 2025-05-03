import mongoengine as me
import os
from models.message_board import MessageBoard

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
    calendar_id = me.StringField(default='')

    def save(self, *args, **kwargs):
        is_new = self._created
        super().save(*args, **kwargs)
        
        # Create message board only for new teams
        if is_new:
            try:
                message_board = MessageBoard(team_id=self.name)  # team_id is the team name
                message_board.save()
            except Exception:
                # If message board creation fails, we can ignore the error
                pass