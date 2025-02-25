from setup import app, api
from models.User import User
from models.ChatMessage import ChatMessage
from models.ChatRoom import ChatRoom
from models.ChatRoomUser import ChatRoomUser
from routes.GetUser import GetUser
from routes.Login import Login
from routes.RefreshToken import RefreshToken

api.add_resource(GetUser,'/user')
api.add_resource(Login,'/login')
api.add_resource(RefreshToken, '/refresh')


if __name__ == "__main__":
    app.run(host='0.0.0.0',port=5050,debug=True)
