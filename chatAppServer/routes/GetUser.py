from setup import Resource, jwt_required, check_user_exists
from models.User import User


class GetUser(Resource):
    @jwt_required()
    @check_user_exists
    def get(self,user):
        return user.to_dict(
            only=("id", "username", "role", 'chat_rooms.chat_room.id', 'chat_rooms.chat_room.participants.user.id', 'chat_rooms.chat_room.participants.user.username')
        ), 200
