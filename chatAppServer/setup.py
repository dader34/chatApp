from flask import Flask, render_template, request, make_response
from flask_cors import CORS
from datetime import datetime, timedelta
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity, unset_access_cookies, unset_refresh_cookies, create_access_token, create_refresh_token, set_access_cookies, set_refresh_cookies, get_jwt
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import create_engine, MetaData
from dotenv import load_dotenv
from flask_restful import Api, Resource
import resend
import time
import bcrypt
import uuid
import pytz
import os
from functools import wraps


# Load environment variables from .env file
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

RESEND_API_KEY=os.environ.get('RESEND_API_KEY')

# Set JWT secret key and token expiration settings
# Configure Flask app
app.config["SQLALCHEMY_DATABASE_URI"] = 'sqlite:///test.db'
app.config['JWT_TOKEN_LOCATION'] = ['cookies']
app.config['JWT_COOKIE_SAMESITE'] = 'None'
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {'pool_pre_ping': True}
app.config['JWT_COOKIE_SECURE'] = True
app.config['PROPAGATE_EXCEPTIONS'] = True
app.config['JWT_SECRET_KEY'] = os.environ.get("KEY")
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=1)
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=30)

# Enable Cross-Origin Resource Sharing (CORS) for the app
cors = CORS(app, supports_credentials=True)

convention = {
  "ix": "ix_%(column_0_label)s",
  "uq": "uq_%(table_name)s_%(column_0_name)s",
  "ck": "ck_%(table_name)s_%(constraint_name)s",
  "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
  "pk": "pk_%(table_name)s"
}

resend.api_key = RESEND_API_KEY


metadata = MetaData(naming_convention=convention)

# Initialize SQLAlchemy, Migrate, and Flask-RESTful API
db = SQLAlchemy(app, metadata=metadata)
migrate = Migrate(app, db)
api = Api(app)

# Initialize JWT Manager
jwt = JWTManager(app)

# Store the start time of the application
start_time = datetime.now()

def current_time():
    """
    Get the current time in Mountain Time Zone (America/Denver).

    Returns:
        datetime: Current time in Mountain Time Zone.
    """
    utc_now = datetime.utcnow()
    mountain_timezone = pytz.timezone('America/Denver')
    mountain_time = utc_now.replace(tzinfo=pytz.utc).astimezone(mountain_timezone)
    return mountain_time

def generate_unique_uuid(cls, length=8):
    """
    Generate a unique UUID of specified length.

    Args:
        cls: Class to check for existing UUIDs.
        length (int, optional): Length of the UUID. Defaults to 8.

    Returns:
        str: Unique UUID.
    """
    while True:
        new_uuid = str(uuid.uuid4())[:8]
        existing_instance = cls.query.filter_by(id=new_uuid).first()
        if not existing_instance:
            return new_uuid

def check_user_exists(func):
    """
    Decorator to check if a user exists in the database.

    Args:
        func (function): Function to be decorated.

    Returns:
        function: Decorated function.
    """
    from models.User import User
    @wraps(func)
    def wrapper(*args, **kwargs):
        if user := db.session.query(User).filter_by(id=get_jwt_identity()).first():
            return func(*args, user, **kwargs)
        else:
            return {'error': 'User not found'}, 404
    return wrapper