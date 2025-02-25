import * as ReactDOM from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import routes from './routes.jsx';
import './index.css'
import 'bootstrap-icons/font/bootstrap-icons.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
const router = createBrowserRouter(routes);


root.render(
  <RouterProvider router={router}>

  </RouterProvider>
)
