from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.orm import relationship
from setup import db, current_time, generate_unique_uuid
from sqlalchemy.ext.hybrid import hybrid_property


class ChatRoom(db.Model, SerializerMixin):
    __tablename__ = 'chat_rooms'

    id = db.Column(db.String, default=lambda: generate_unique_uuid(ChatRoom),primary_key=True)
    name = db.Column(db.String,default='New Chat', nullable=False, unique=True)
    created_at = db.Column(db.String, default=current_time, nullable=False)

    messages = relationship('ChatMessage', back_populates='chat_room', cascade="all, delete-orphan")
    participants = relationship('ChatRoomUser', back_populates='chat_room', cascade="all, delete-orphan")
    
    
    @hybrid_property
    def last_message(self):
        return self.messages[-1] if len(self.messages) > 0 else ''
