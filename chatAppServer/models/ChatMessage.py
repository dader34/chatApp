from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.orm import relationship, validates
from setup import db, current_time, generate_unique_uuid

class ChatMessage(db.Model, SerializerMixin):
    __tablename__ = 'chat_messages'
    
    serialize_only = ('id','sender_id','message','created_at','status')

    id = db.Column(db.String, default=lambda: generate_unique_uuid(ChatMessage),primary_key=True)
    sender_id = db.Column(db.String, db.ForeignKey('users.id'), nullable=False)
    chat_room_id = db.Column(db.String, db.ForeignKey('chat_rooms.id'), nullable=False)
    message = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.String, default=current_time, nullable=False)
    status = db.Column(db.String, default='Sent')  # Possible values: 'Sent', 'Delivered', 'Read'

    sender = relationship('User', back_populates='sent_messages')
    chat_room = relationship('ChatRoom', back_populates='messages')

    @validates('message')
    def validate_message(self, key, message):
        if not message.strip():
            raise ValueError("Message cannot be empty.")
        return message

    @validates('status')
    def validate_status(self, key, status):
        allowed_statuses = ['Sent', 'Delivered', 'Read']
        if status not in allowed_statuses:
            raise ValueError(f"Invalid status. Allowed statuses are: {', '.join(allowed_statuses)}")
        return status
