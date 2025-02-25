
import { useSnackbar } from 'notistack';
import { createContext, useContext, useState } from 'react';
// import Notiflix from "notiflix";
import { PulseLoader } from 'react-spinners';
// import toast from 'react-hot-toast'


const NotifyContext = createContext();

export const useNotify = () => {
  return useContext(NotifyContext);
};

export const NotifyProvider = ({ children }) => {

  const { enqueueSnackbar, closeSnackbar } = useSnackbar()

  const [connected, setConnected] = useState(true)

  // const [loading, setLoading] = useState(true)

//   const notiflixOptions = {
//     success: Notiflix.Notify.success,
//     failure: Notiflix.Notify.failure,
//     info: Notiflix.Notify.info
//   }

  const notistackOptions = {
    success: (message, ...args) => enqueueSnackbar(message, { variant: 'success', ...args }),
    failure: (message, ...args) => enqueueSnackbar(message, { variant: 'error', ...args }),
    info: (message, ...args) => enqueueSnackbar(message, { variant: 'info', ...args }),
  }

  const selectedLib = notistackOptions

//   if (selectedLib === notiflixOptions) {

//     // Init Notify Module
//     Notiflix.Notify.init({});

//     // Init Report Module
//     Notiflix.Report.init({});

//     // Init Confirm Module
//     Notiflix.Confirm.init({});

//     // Init Loading Module
//     Notiflix.Loading.init({});
//   }

  const extractMessage = (response) => {

    const findMessage = (data, _resolve) => {
      if (data.message) _resolve(data.message);
      else if (data.error) _resolve(Array.isArray(data.error) ? data.error[0] : data.error);
      else if (data.msg) data.msg === 'Token has expired' ? _resolve(data.msg + ' please refresh') : _resolve(data.msg)
      else if (data.success) _resolve(data.success);
      else _resolve('An unexpected error has occurred');
    };

    return new Promise((resolve) => {
      if (response && response.json) {
        response.json().then((data) => {
          findMessage(data, resolve);
        });
      } else {
        if (response.statusText) resolve(response.statusText);
        else if (response.status) resolve(`Error ${response.status}`);
        else findMessage(response, resolve);
      }
    });
  };


  const handleMessage = (response, messageType, prefix) => {
    extractMessage(response).then((successMessage) => {
      messageType(successMessage, prefix);
    });
  };

  const error = (message, prefix) => {

    closeSnackbar()

    console.error('An error has occured:', message)

    if (message && typeof message === 'object') {
      // If message is an object, treat it as a response object
      handleMessage(message, error, prefix);
    } else {
      // Treat message as a string
      selectedLib.failure(`${prefix || 'Error'}: ${message || 'An unexpected error has occurred'}`);
    }
  };
  //Check for data.msg or data.error or data.message or data.success


  const success = (message, prefix) => {

    if (message && typeof message === 'object') {
      // If message is an object, treat it as a response object
      handleMessage(message, success, prefix);
    } else {
      // Treat message as a string
      selectedLib.success(`${prefix || ''} ${message || 'Success!'}`);
    }
  };

  const spinner = (message = 'Loading, please wait...', options = {}) => {
    const key = enqueueSnackbar(
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <PulseLoader size={6} color="#fff" />
        <span>{message}</span>
      </div>,
      {
        variant: 'info',
        persist: true, // Keeps the notification open until manually closed
        ...options
      }
    );

    return {
      complete: (success = true, completionMessage, bypass=false) => {
        closeSnackbar(key);
        if(bypass){
            return
        }
        if (success) {
          selectedLib.success(completionMessage);
        } else if (completionMessage) {
          selectedLib.failure(completionMessage);
        }
      }
    };
  };




  const info = (message, prefix) => {

    if (message && typeof message === 'object') {
      // If message is an object, treat it as a response object
      handleMessage(message, info, prefix);
    } else {
      // Treat message as a string
      selectedLib.info(`${prefix || ''}: ${message || 'Success!'}`);
    }
  };

  const choice = (message, _success, _cancel, options = { button1: 'Yes', button2: 'No', messageStyle: { 'fontWeight': 'bold' } }) => {
    const choicePrompt = (
      <div className="alert alert-info element-to-hide">
        <p className="mb-0" style={options.messageStyle}>
          {message}
        </p>
        <div className="mt-2">
          <button className="btn btn-danger mr-2" type='button' onClick={() => {
            closeSnackbar()
            if (_success) {
              _success()
            }
          }}>
            {options['button1']}
          </button>
          <button className="btn btn-secondary" type='button' onClick={() => {
            closeSnackbar()
            if (_cancel) {
              _cancel()
            }
          }}>
            {options['button2']}
          </button>
        </div>
      </div>
    );

    enqueueSnackbar(choicePrompt, {
      variant: 'info',
      persist: true,
    });
  }

  const serverDisconnect = () => {
    if (connected) {
      enqueueSnackbar('⚠ Server Disconnected! Please check your connection.', {
        variant: 'error',
        persist: false,
        anchorOrigin: { vertical: 'top', horizontal: 'center' },
        ContentProps: {
          style: {
            width: '100vw',
            fontSize: '18px',
            fontWeight: 'bold',
            textAlign: 'center',
            backgroundColor: '#d32f2f',
            color: '#fff',
            padding: '15px',
            position: 'fixed',
            top: '0',
            left: '0',
            zIndex: 9999,
            boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
          },
          className: 'element-to-hide'
        },
      });
      setConnected(false)
    }

  };

  const originalFetch = window.fetch;

  window.fetch = async (input, init, spinnerOptions={}) => {
    // Show the loading spinner before request starts
    if(spinnerOptions.active){

      const loader = spinner(spinnerOptions.spinnerMessage || 'Loading, please wait...');

      return originalFetch(input, init)
      .then(response => {
        if(response.ok){
            loader.complete(true, spinnerOptions.spinnerSuccess || 'Request completed successfully');
        }else{
            loader.complete(0, 0, true);
        }
        
        return response; // Always return the response, even if it's an error response
      })
    }
    return originalFetch(input,init)
    
  };

  // const localServerStatus = connected;

  // const setLocalServerStatus = setConnected;



  return (
    <NotifyContext.Provider value={{ error, success, spinner, choice, info, serverDisconnect }}>
      {children}
    </NotifyContext.Provider>
  );
};
