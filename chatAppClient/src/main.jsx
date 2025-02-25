import * as ReactDOM from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import routes from './routes.jsx';
import './index.css'
import 'bootstrap-icons/font/bootstrap-icons.css';
import { AuthProvider } from './context/AuthContext';
import { SnackbarProvider } from 'notistack'
import { NotifyProvider } from './context/NotificationContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
const router = createBrowserRouter(routes);


root.render(
  <SnackbarProvider autoHideDuration={3000} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
    <NotifyProvider>
      <AuthProvider>
        <RouterProvider router={router}>

        </RouterProvider>
      </AuthProvider>
    </NotifyProvider>
  </SnackbarProvider>


)
