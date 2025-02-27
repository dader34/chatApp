from setup import Resource, jwt_required, check_user_exists, db, request
from models.User import User
from models.ChatRoom import ChatRoom


class SendMessage(Resource):
    @jwt_required()
    @check_user_exists
    def post(self,user):
        chat_id = request.json.get('chat_id')
        message = request.json.get('message')
        
        if chat_id is not None and message is not None:
            try:
                return user.send_message(chat_room=chat_id,message_text=message).to_dict()
            except Exception as e:
                return {'error':str(e)}, 400
            
        else:
            return {'error':'Invalid arguments'}, 400
