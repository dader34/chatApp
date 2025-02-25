from setup import Resource, jwt_required, check_user_exists
from models.User import User


class GetUser(Resource):
    @jwt_required()
    @check_user_exists
    def get(self,user):
        return user.to_dict(
            only=("id", "username", "role")
        ), 200
