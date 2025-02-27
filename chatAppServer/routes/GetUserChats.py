from setup import Resource, jwt_required, check_user_exists, db
from models.User import User
from models.ChatRoom import ChatRoom


class GetUserChats(Resource):
    @jwt_required()
    @check_user_exists
    def get(self,user):
        if len(user.chat_rooms) > 0:
            return [chat_room.chat_room.to_dict(only=('id','messages','participants.user.id','participants.user.username','last_message')) for chat_room in user.chat_rooms]
        else:
            return {[]}, 200
