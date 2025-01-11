import mongoengine as me
import os

# Load environment variables
MONGODB_URI = os.getenv('MONGODB_URI')

me.connect(host = MONGODB_URI)


class SetScore(me.EmbeddedDocument):
    team_score = me.IntField(required=False, default=0)
    opposite_team_score = me.IntField(required=False, default = 0)


class AttackStats(me.EmbeddedDocument):
    attempts = me.IntField(required=False, default = 0)
    kills = me.IntField(required=False, default = 0)
    errors = me.IntField(required=False, default = 0)
    kill_percentage = me.FloatField(required=False, default = 0)


class ServeStats(me.EmbeddedDocument):
    attempts = me.IntField(required=False, default = 0)
    aces = me.IntField(required=False, default = 0)
    errors = me.IntField(required=False, default = 0)
    ace_percentage = me.FloatField(required=False, default = 0)


class ServeReceivesStats(me.EmbeddedDocument):
    attempts = me.IntField(required=False, default = 0)
    one_balls = me.IntField(required=False, default = 0)
    two_balls = me.IntField(required=False, default = 0)
    three_balls = me.IntField(required=False, default = 0)
    errors = me.IntField(required=False, default = 0)
    efficiency = me.FloatField(required=False, default = 0)


class DigsStats(me.EmbeddedDocument):
    attempts = me.IntField(required=False, default = 0)
    errors = me.IntField(required=False, default = 0)
    efficiency = me.FloatField(required=False, default = 0)


class SettingStats(me.EmbeddedDocument):
    attempts = me.IntField(required=False, default = 0)
    errors = me.IntField(required=False, default = 0)
    assists = me.IntField(required=False, default = 0)


class BlocksStats(me.EmbeddedDocument):
    attempts = me.IntField(required=False, default = 0)
    kills = me.IntField(required=False, default = 0)
    errors = me.IntField(required=False, default = 0)


class PlayerStats(me.EmbeddedDocument):
    position = me.StringField(required=False, default = '')
    starter = me.BooleanField(required=False, default = True)
    attack = me.EmbeddedDocumentField(AttackStats, required=False, default = AttackStats())
    serve = me.EmbeddedDocumentField(ServeStats, required=False, default = ServeStats())
    serve_recieves = me.EmbeddedDocumentField(ServeReceivesStats, required=False, default = ServeReceivesStats())
    digs = me.EmbeddedDocumentField(DigsStats, required=False, default = DigsStats())
    setting = me.EmbeddedDocumentField(SettingStats, required=False, default = SettingStats())
    blocks = me.EmbeddedDocumentField(BlocksStats, required=False, default = BlocksStats())


# Define the main document schema
class GameStatistics(me.Document):
    team_id = me.StringField(required=True)
    opposite_team_name = me.StringField(required=True)
    game_date = me.DateTimeField(required=True)
    team_sets_won_count = me.IntField(default=0)
    team_sets_lost_count = me.IntField(default=0)
    sets_scores = me.MapField(field=me.EmbeddedDocumentField(SetScore), default = {})
    team_stats = me.MapField(field=me.EmbeddedDocumentField(PlayerStats), default = {})

    def __str__(self):
        return f'GameStatistics(team_id={self.team_id}, opposite_team_name={self.opposite_team_name}, game_date={self.game_date})'
