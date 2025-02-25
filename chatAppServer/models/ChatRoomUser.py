from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.orm import relationship
from setup import db, generate_unique_uuid

class ChatRoomUser(db.Model, SerializerMixin):
    __tablename__ = 'chat_room_users'

    id = db.Column(db.String, default=lambda: generate_unique_uuid(ChatRoomUser),  primary_key=True)
    user_id = db.Column(db.String, db.ForeignKey('users.id'), nullable=False)
    chat_room_id = db.Column(db.String, db.ForeignKey('chat_rooms.id'), nullable=False)
    role = db.Column(db.String, default='Member')  # Possible values: 'Admin', 'Member'

    user = relationship('User', back_populates='chat_rooms')
    chat_room = relationship('ChatRoom', back_populates='participants')
