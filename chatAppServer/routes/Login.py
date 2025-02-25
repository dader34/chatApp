from setup import (
    Resource,
    db,
    request,
    make_response,
    timedelta,
    create_access_token,
    create_refresh_token,
    set_access_cookies,
    set_refresh_cookies,
    resend,
    load_dotenv,
)
from models.User import User
from models.AuthCode import AuthCode


class Login(Resource):

    def post(self):
        # Retrieve email and password from the request
        email = request.json.get("email")
        password = request.json.get("password")

        _2fa_code = request.json.get("2fa_code")

        print(_2fa_code)

        load_dotenv()

        if (_2fa_code is not None):
            if auth_code := db.session.get(AuthCode, _2fa_code):

                if not (auth_code.is_expired):
                    # print(auth_code.user)
                    # print(auth_code.id)

                    # Create access and refresh tokens
                    access_token = create_access_token(
                        identity=auth_code.user.id,
                        expires_delta=timedelta(hours=1),
                    )

                    refresh_token = create_refresh_token(
                        identity=auth_code.user.id,
                        expires_delta=timedelta(days=30),
                    )

                    # Create response with user details and set cookies
                    response = make_response(
                        auth_code.user.to_dict(only=("id", "email", "role")), 200
                    )
                    set_access_cookies(response, access_token)
                    set_refresh_cookies(response, refresh_token)
                    
                    return response
                else:
                    return {"error": "Your auth code has expired"}, 400

            else:
                return {"error": "Invalid 2fa code"}, 400

        # Validate email and password length
        if not (5 <= len(email) <= 25 or 5 <= len(password) <= 25):
            return {
                "error": "email and password must be between 5 and 25 characters"
            }, 400

        # Check if the user exists
        if user := User.query.filter(
            db.func.lower(User.email) == db.func.lower(email)
        ).first():
            # Authenticate user
            if user.authenticate(password):

                if 1 and not 0:
                    # Create access and refresh tokens
                    access_token = create_access_token(
                        identity=user.id,
                        expires_delta=timedelta(hours=1),
                    )

                    refresh_token = create_refresh_token(
                        identity=user.id,
                        expires_delta=timedelta(days=30),
                    )

                    # Create response with user details and set cookies
                    response = make_response(
                        user.to_dict(only=("id", "email", "role")), 200
                    )
                    set_access_cookies(response, access_token)
                    set_refresh_cookies(response, refresh_token)

                    return response

                if user.email:

                    try:

                        # Delete all pre existing 2fa codes, could possibly also let 2 exist concurrently
                        for code in AuthCode.query.filter(
                            AuthCode.email == user.email
                        ).all():
                            db.session.delete(code)

                        new_2fa_code = AuthCode(email=user.email)

                        db.session.add(new_2fa_code)
                        db.session.commit()

                        params: resend.Emails.SendParams = {
                            "from": "Admin <Administrator@chatapp.dev>",
                            "to": [user.email],
                            "subject": "Chat App 2FA Code",
                            "html": f"<strong>Your 2FA code is: {new_2fa_code.id}</strong>",
                        }

                        resend.Emails.send(params)

                        return {"success": "2FA"}, 200

                    except Exception as e:

                        db.session.rollback()
                        return {"error": str(e)}, 500
                else:

                    return {
                        "error": "Your account does not have an email associated with it, please have an admin set your email."
                    }, 400

            else:
                return {"error": "Invalid password"}, 400
        else:
            return {"error": "User not found"}, 404
