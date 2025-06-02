from datetime import datetime
from . import db

class PushToken(db.Model):
    __tablename__ = 'push_tokens'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(255), db.ForeignKey('users.id'), unique=True, nullable=False)
    token = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship with User model
    user = db.relationship('User', backref=db.backref('push_token', uselist=False))

    def __repr__(self):
        return f'<PushToken {self.id}>' 