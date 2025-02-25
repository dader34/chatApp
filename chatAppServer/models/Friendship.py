
from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.orm import relationship
from sqlalchemy.ext.hybrid import hybrid_property
from setup import db, bcrypt, current_time, generate_unique_uuid
import base64

# Friendship model to establish relationships between users
class Friendship(db.Model, SerializerMixin):
    __tablename__ = 'friendships'
    
    id = db.Column(db.String, default=lambda: generate_unique_uuid(Friendship), primary_key=True)
    user_id = db.Column(db.String, db.ForeignKey('users.id'), nullable=False)
    friend_id = db.Column(db.String, db.ForeignKey('users.id'), nullable=False)
    status = db.Column(db.String, default='pending', nullable=False)  # pending, accepted, rejected, blocked
    created_at = db.Column(db.String, default=current_time, nullable=False)
    updated_at = db.Column(db.String, default=current_time, nullable=False)
    
    # Define relationship to the initiator of the friendship
    user = relationship('User', foreign_keys=[user_id], back_populates='sent_friend_requests')
    
    # Define relationship to the recipient of the friendship request
    friend = relationship('User', foreign_keys=[friend_id], back_populates='received_friend_requests')
    
    # Enforce unique constraint to prevent duplicate friendship records
    __table_args__ = (
        db.UniqueConstraint('user_id', 'friend_id', name='unique_friendship'),
    )
    
    serialize_rules = ('-user.sent_friend_requests', '-user.received_friend_requests','-friend.sent_friend_requests', '-friend.received_friend_requests')
