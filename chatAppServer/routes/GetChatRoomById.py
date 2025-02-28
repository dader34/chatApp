from setup import Resource, jwt_required, check_user_exists, db, request
from models.User import User
from models.ChatRoom import ChatRoom
from models.ChatMessage import ChatMessage


class GetChaRoomtById(Resource):
    @jwt_required()
    @check_user_exists
    def get(self,user,id):
        page = request.args.get("page")
        limit = request.args.get("limit")
        
        if chat := db.session.get(ChatRoom, id):
            
            template = chat.to_dict(only=('id','participants.user.id','participants.user.username'))
            
            
            if page and limit:
                chat_messages = ChatMessage.query.filter_by(chat_room_id=id).all()[
                    int(limit) * int(page) : (int(limit) * int(page)) + int(limit)
                ]
                
                template['messages'] = [message.to_dict() for message in chat_messages]
                return template
                
            else:
                return {'error':'Invalid arguments'}, 400
            
        else:
            return {'error':'Chat room not found'}, 404
        
        
            
       
