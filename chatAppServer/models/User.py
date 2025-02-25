from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.orm import relationship
from models.Friendship import Friendship
from sqlalchemy.ext.hybrid import hybrid_property
from setup import db, bcrypt, current_time, generate_unique_uuid
import base64

class User(db.Model, SerializerMixin):
    __tablename__ = 'users'

    id = db.Column(db.String, default=lambda: generate_unique_uuid(User), primary_key=True)
    username = db.Column(db.String, nullable=False, unique=True)
    role = db.Column(db.String, default='user', nullable=False)
    password_hash = db.Column(db.String, nullable=False)
    created_at = db.Column(db.String, default=current_time, nullable=False)
    email = db.Column(db.String)
    status = db.Column(db.String, default='Active')

    sent_messages = db.relationship('ChatMessage', back_populates='sender', cascade="all, delete-orphan")
    chat_rooms = db.relationship('ChatRoomUser', back_populates='user', cascade="all, delete-orphan")
    
    # Add relationships for friend requests
    sent_friend_requests = db.relationship('Friendship', foreign_keys='Friendship.user_id', 
                                       back_populates='user', cascade="all, delete-orphan")
    received_friend_requests = db.relationship('Friendship', foreign_keys='Friendship.friend_id', back_populates='friend', cascade="all, delete-orphan")
    
    # Add serialization rules
    serialize_rules = ('-password_hash', '-sent_messages.sender', '-chat_rooms.user', '-sent_friend_requests.user', '-received_friend_requests.friend')

    @hybrid_property
    def password(self):
        return self.password_hash
    
    @password.setter
    def password(self, password):
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        self.password_hash = base64.b64encode(hashed_password).decode('utf-8')

    def authenticate(self, password):
        hashed_password = base64.b64decode(self.password_hash.encode('utf-8'))
        return bcrypt.checkpw(password.encode('utf-8'), hashed_password)
    
    # Helper methods for managing friendships
    def send_friend_request(self, friend):
        if friend.id == self.id:
            return False, "Cannot send friend request to yourself"
        
        # Check if friendship already exists
        existing = Friendship.query.filter(
            ((Friendship.user_id == self.id) & (Friendship.friend_id == friend.id)) |
            ((Friendship.user_id == friend.id) & (Friendship.friend_id == self.id))
        ).first()
        
        if existing:
            return False, "Friend request already exists"
        
        friendship = Friendship(user_id=self.id, friend_id=friend.id)
        db.session.add(friendship)
        db.session.commit()
        return True, friendship
    
    def accept_friend_request(self, friendship_id):
        friendship = Friendship.query.filter_by(id=friendship_id, friend_id=self.id, status='pending').first()
        if not friendship:
            return False, "Friend request not found"
        
        friendship.status = 'accepted'
        friendship.updated_at = current_time()
        db.session.commit()
        return True, friendship
    
    def reject_friend_request(self, friendship_id):
        friendship = Friendship.query.filter_by(id=friendship_id, friend_id=self.id, status='pending').first()
        if not friendship:
            return False, "Friend request not found"
        
        friendship.status = 'rejected'
        friendship.updated_at = current_time()
        db.session.commit()
        return True, friendship
    
    def block_user(self, user_id):
        # Check if there's an existing relationship
        friendship = Friendship.query.filter(
            ((Friendship.user_id == self.id) & (Friendship.friend_id == user_id)) |
            ((Friendship.user_id == user_id) & (Friendship.friend_id == self.id))
        ).first()
        
        if friendship:
            friendship.status = 'blocked'
            friendship.updated_at = current_time()
        else:
            # Create a new blocked relationship
            friendship = Friendship(user_id=self.id, friend_id=user_id, status='blocked')
            db.session.add(friendship)
            
        db.session.commit()
        return True, friendship
    
    @property
    def friends(self):
        """Return all accepted friends"""
        friends1 = db.session.query(User).join(
            Friendship, 
            (Friendship.friend_id == User.id) & 
            (Friendship.user_id == self.id) & 
            (Friendship.status == 'accepted')
        ).all()
        
        friends2 = db.session.query(User).join(
            Friendship, 
            (Friendship.user_id == User.id) & 
            (Friendship.friend_id == self.id) & 
            (Friendship.status == 'accepted')
        ).all()
        
        return friends1 + friends2
    
    @property
    def pending_friend_requests(self):
        """Return pending friend requests received by this user"""
        return db.session.query(Friendship).filter_by(
            friend_id=self.id, 
            status='pending'
        ).all()
