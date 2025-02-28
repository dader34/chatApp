import { createContext, useContext, useState } from 'react';
import { useNotify } from './NotificationContext.jsx';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const { error  } = useNotify();

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        

        // Parse the date to ensure it is treated as a local date
        const [year, month, day] = dateStr.split(' ')[0].split('-').map(Number);
        let [hour, minute, _] = dateStr.split(" ")[1].split(':')
        console.log(hour, minute)
        const date = new Date(year, month - 1, day, hour, minute); // Month is 0-based in JavaScript
        let options = { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' };

        return date.toLocaleDateString(undefined, options);
    };


    // Function to get a specific cookie value by name
    const getCookie = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return '';
    };

    // Env variable for distinction between production and development
    const DEV = true;
    const APP_URL = DEV ? 'http://127.0.0.1:5050' : '';

    // The reason im returning the fetch and returning true and false is because im passing these functions
    // out of this component since its being shared through useContext() and i want full control of the fetch when im making the login and logout requests
    // this is also why im returning the error messages this way

    // Function to refresh the user session
    const refreshUser = () => {
        return fetch(`${APP_URL}/user`, {
            credentials: 'include'
        }).then(resp => {
            if (resp.ok) {
                resp.json().then(data => setUser(data));
                return true;
            } else {
                if (resp.status === 401) {
                    fetch(`${APP_URL}/refresh`, {
                        headers: {
                            'X-CSRF-TOKEN': getCookie('csrf_refresh_token')
                        },
                        credentials: 'include'
                    }).then(res => {
                        if (res.ok) {
                            res.json().then(data => setUser(data));
                            return true;
                        } else {
                            return false;
                        }
                    })
                    .catch(e => error(e));
                } else {
                    error(resp);
                    return false;
                }
            }
        }).catch(e => error(e));
    };

    //Possibly work on in future so i dont have to use ?.whatever on the user object
    // const getUser = async () => {
    //     const loggedIn = await refreshUser();
    //     return loggedIn ? user : false;
    // };
    

    // Function to handle send login creds to server for response
    const login = (email, password, after) => {
        return fetch(`${APP_URL}/login`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password }),
            credentials: 'include'
        },{active: true, spinnerMessage: "Checking credentials", spinnerSuccess:'Logged In!'}).then( (resp) => {
            if (!resp.ok) {
               error(resp)
               if(after){
                after()
               }
            } else{
                if(after){
                    resp.json().then(data =>{
                        setUser(data)
                        after(data)
                    })
                }
            }
        }).catch(e => error(e));
    };

    // Second step of login

    const handle2FASubmit = (code) => {
        return fetch(`${APP_URL}/login`,{
          method: 'POST',
          headers:{
            'Content-Type':'application/json'
          },
          body:JSON.stringify({'2fa_code':code}),
          credentials: 'include'
        },{active: true, spinnerMessage: "Verifying 2FA code",spinnerSuccess:'Logged in successfully!'}).then(async resp=>{
          if(resp.ok){
            resp.json().then(data => setUser(data));
            return 'Successfully logged in!';
          }else{
            return await resp.json().then(data => { 
                return { 'error': data['error'] }; 
            });
          }
        }).catch(e => { return { 'error': e.message } })
      };

    // Function to handle user logout
    const logout = () => {
        return fetch(`${APP_URL}/logout`, {
            method: 'DELETE',
            headers: {
                "X-CSRF-TOKEN": getCookie('csrf_access_token')
            },
            credentials: 'include'
        },
        {
            active: true, 
            spinnerMessage: "Logging out",
            spinnerSuccess:'Logged out successfully!'
        }).then(async (resp) => {
            if (resp.status === 204) {
                // Remove user from local context
                setUser(null);
                return true;
            } else {
                // Wait for error message and package for error function
                return await resp.json().then(data => {
                    return { 'error': data['error'] }; 
                });
            }
        }).catch(e => { return { 'error': e.message } });
    };

    return (
        <AuthContext.Provider value={{user, login, logout, refreshUser, getCookie, APP_URL, DEV, handle2FASubmit, formatDate}}>
            {children}
        </AuthContext.Provider>
    );
};
