from setup import Api, Resource, db, request, jwt_required, get_jwt_identity, get_jwt, check_user_exists
from models.User import User

class SignUp(Resource):
        
    def post(self):

        username = request.json.get('username')

        password = request.json.get('password')

        email = request.json.get('email')

        if (User.query.filter_by(email=email).first()):
            return {'error':'A user with that email already exists'}, 400
        
        

        if (username is not None and password is not None):

            try:
                user = User(username=username,password=password,email=email)
                user.password = password

                if email is not None:
                    user.email = email

                db.session.add(user)
                db.session.commit()
                return {'success':user.id},201
            except Exception as e:
                db.session.rollback()
                return {'error':e.args}, 400
        else:
            return {'error':'Invalid arguments'},400