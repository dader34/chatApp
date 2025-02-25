from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.orm import relationship
from sqlalchemy.ext.hybrid import hybrid_property
from setup import db, bcrypt, current_time, generate_unique_uuid
import base64

class User(db.Model, SerializerMixin):
    __tablename__ = 'users'

    id = db.Column(db.String, default=lambda: generate_unique_uuid(User), primary_key=True)
    username = db.Column(db.String, nullable=False, unique=True)
    role = db.Column(db.String, nullable=False)
    password_hash = db.Column(db.String, nullable=False)
    created_at = db.Column(db.String, default=current_time, nullable=False)
    email = db.Column(db.String)
    status = db.Column(db.String, default='Active')

    sent_messages = relationship('ChatMessage', back_populates='sender', cascade="all, delete-orphan")
    chat_rooms = relationship('ChatRoomUser', back_populates='user', cascade="all, delete-orphan")

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
