// import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useCallback, useEffect } from 'react';


const ChatApp = () => {

  const {user,refreshUser} = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!location.pathname.startsWith('/reset_password/')) {
      refreshUser().then((loggedIn) => {
        if (!loggedIn) {
          navigate('/login');
        }
      });
    }
  }, []); // eslint-disable-line
  
  return( user ?
    <Outlet/> : null
  )

};

export default ChatApp;