from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.orm import validates
from setup import db, generate_unique_uuid, current_time, timedelta, datetime
from sqlalchemy.ext.hybrid import hybrid_property
from models.User import User

class AuthCode(db.Model, SerializerMixin):
    __tablename__ = 'auth_codes'

    id = db.Column(db.String, primary_key=True, default=lambda: generate_unique_uuid(AuthCode))

    email = db.Column(db.String, nullable=False)
    
    created_at = db.Column(db.String, default=current_time, nullable=False)

    @hybrid_property
    def user(self):
        if found := User.query.filter(
                        db.func.lower(User.email) == db.func.lower(self.email)
                    ).first():
            return found
        else:
            return None
        
    @hybrid_property
    def is_expired(self):
        # Expires in 5 minutes
        return str(current_time()) > str(datetime.fromisoformat(self.created_at) + timedelta(minutes=5))