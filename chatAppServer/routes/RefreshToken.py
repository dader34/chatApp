from setup import db, Resource, make_response, create_access_token, jwt_required, set_access_cookies, get_jwt_identity, check_user_exists
from models.User import User

class RefreshToken(Resource):
    @jwt_required(refresh=True)
    @check_user_exists
    def get(self,user):
        try:

            new_access_token = create_access_token(
                    identity = user.id
                )
            response = make_response(user.to_dict(only=('id','username','role')), 200)
            set_access_cookies(response, new_access_token)

            return response
        except Exception as e:

            return {"error": e.args}, 500