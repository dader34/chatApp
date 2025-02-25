from setup import Resource, jwt_required, check_user_exists, db
from models.User import User
from models.ChatRoom import ChatRoom


class GetChaRoomtById(Resource):
    @jwt_required()
    @check_user_exists
    def get(self,user,id):
        
        if chat := db.session.get(ChatRoom, id):
            return chat.to_dict(only=('messages.id','messages.message','messages.sender','message.created_'))
        else:
            return {'error':'Chat room not found'}, 404
