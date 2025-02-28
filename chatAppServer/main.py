from flask import request
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from functools import wraps
from setup import app, api, socketio, join_room, leave_room, send, jwt, db
from models.User import User
from models.ChatMessage import ChatMessage
from models.ChatRoom import ChatRoom
from models.ChatRoomUser import ChatRoomUser
from routes.GetUser import GetUser
from routes.Login import Login
from routes.RefreshToken import RefreshToken
from routes.Signup import SignUp
from routes.GetChatRoomById import GetChaRoomtById
from routes.GetUserChats import GetUserChats
from routes.SendMessage import SendMessage

api.add_resource(GetUser,'/user')
api.add_resource(Login,'/login')
api.add_resource(RefreshToken, '/refresh')
api.add_resource(SignUp, '/signup')
api.add_resource(GetChaRoomtById, '/chats/<string:id>')
api.add_resource(GetUserChats, '/user/chats')
api.add_resource(SendMessage, '/messages/send')

# Enabling CORS for Socket.IO with cookie support
# @app.after_request
# def after_request(response):
#     response.headers.add('Access-Control-Allow-Origin', request.headers.get('Origin', '*'))
#     response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
#     response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
#     response.headers.add('Access-Control-Allow-Credentials', 'true')
#     return response

# Custom decorator for Socket.IO events that require authentication
def jwt_required_socketio(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            # Verify JWT in cookies (this will look for the cookie automatically)
            verify_jwt_in_request()
            
            # Get the user identity from the token
            user_id = get_jwt_identity()
            
            # Find the user in the database
            user = db.session.get(User,user_id)
            
            if not user:
                socketio.emit('error', {'message': 'User not found'}, to=request.sid)
                return
                
            # Add the user object to the decorated function's arguments
            return f(user, *args, **kwargs)
            
        except Exception as e:
            # If token verification fails, disconnect the client
            socketio.emit('error', {'message': f'Authentication error: {str(e)}'}, to=request.sid)
            return 
            
            
    return decorated

# Socket.IO connection event with authentication
@socketio.on('connect')
@jwt_required_socketio
def handle_connect(f,user):
    try:
        print(user)
        print(f)
        # request.session['user_id'] = user_id
        
        return True  # Accept the connection
        
    except Exception as e:
        print(f"Connection authentication error: {str(e)}")
        return False  # Reject the connection

# Room joining with authentication
@socketio.on('join')
@jwt_required_socketio
def on_join(user, data):
    try:
        room_id = data.get('room')
        
        if not room_id:
            socketio.emit('error', {'message': 'Room ID is required'}, to=request.sid)
            return
            
        # Check if the room exists
        chat_room = db.session.get(ChatRoom, room_id)
        if not chat_room:
            socketio.emit('error', {'message': 'Chat room not found'}, to=request.sid)
            return
            
        # Check if the user is a participant in the room
        is_participant = ChatRoomUser.query.filter_by(
            user_id=user.id,
            chat_room_id=room_id
        ).first()
        
        if not is_participant:
            # Join the user to the room in the database
            success, result = user.join_room(chat_room)
            if not success:
                socketio.emit('error', {'message': result}, to=request.sid)
                return
                
        # Join the Socket.IO room
        join_room(room_id)
        
        # Notify other users in the room
        socketio.emit('user_joined', {
            'user': user.username,
            'room': room_id,
            'timestamp': result.joined_at if 'result' in locals() else None
        }, to=room_id)
        
        # Confirm to the joined user
        socketio.emit('joined_room', {
            'room': room_id,
            'name': chat_room.name
        }, to=request.sid)
        
    except Exception as e:
        socketio.emit('error', {'message': str(e)}, to=request.sid)

# Room leaving with authentication
@socketio.on('leave')
@jwt_required_socketio
def on_leave(user, data):
    try:
        room_id = data.get('room')
        
        if not room_id:
            socketio.emit('error', {'message': 'Room ID is required'}, to=request.sid)
            return
            
        # Leave the Socket.IO room
        leave_room(room_id)
        
        # Notify other users in the room
        socketio.emit('user_left', {
            'user': user.username,
            'room': room_id
        }, to=room_id)
        
        # Confirm to the user
        socketio.emit('left_room', {
            'room': room_id
        }, to=request.sid)
        
    except Exception as e:
        socketio.emit('error', {'message': str(e)}, to=request.sid)

# Message sending with authentication
@socketio.on('send_message')
@jwt_required_socketio
def handle_message(user, data):
    
    try:
        room_id = data.get('room')
        message_text = data.get('message')
        
        if not room_id or not message_text:
            socketio.emit('error', {'message': 'Room ID and message text are required'}, to=request.sid)
            return
            
        # Send the message using the user's send_message method
        result = user.send_message(room_id, message_text)
        
        if not result:
            socketio.emit('error', {'message': result}, to=request.sid)
            return
            
        # Broadcast the message to the room
        socketio.emit('new_message', {
            'id': result.id,
            'sender_id': user.id,
            'sender_name': user.username,
            'message': message_text,
            'created_at': result.created_at,
            'status': result.status,
            'room': room_id
        }, to=room_id)
        
    except Exception as e:
        socketio.emit('error', {'message': str(e)}, to=request.sid)

if __name__ == "__main__":
    # When using cookies for authentication, engineio ping timeout should be increased
    # to prevent disconnections during periods of inactivity
    # socketio.run(app, host='0.0.0.0', port=5050, debug=True, 
    #              allow_unsafe_werkzeug=True,  # Only for development
    #              cors_allowed_origins="*",    # Adjust for production
    #              ping_timeout=60)
    app.run(host='0.0.0.0', port=5050, debug=True)