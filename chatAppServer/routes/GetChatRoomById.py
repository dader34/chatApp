from setup import Resource, jwt_required, check_user_exists, db
from models.User import User
from models.ChatRoom import ChatRoom


class GetChaRoomtById(Resource):
    @jwt_required()
    @check_user_exists
    def get(self,user,id):
        print(id)
        # print([c.id for c in ChatRoom.query.all()])
        print(user.chat_rooms[0].chat_room.id)
        if chat := db.session.get(ChatRoom, id):
            
            return chat.to_dict(only=('messages','participants.id'))
        else:
            return {'error':'Chat room not found'}, 404
