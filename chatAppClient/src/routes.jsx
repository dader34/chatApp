import ChatApp from "./App"
import ChatHome from "./pages/ChatHome"
import ErrorPage from "./pages/ErrorPage"
import LoginPage from "./pages/LoginPage"

const routes = [
    {
        path:'/',
        element: <ChatApp/>,
        errorElement: <ErrorPage/>,
        children:[
            {
                path: '/',
                element: <ChatHome />
            },
            {
                path: '/error',
                element: <ErrorPage/>
            }
            
        ]
    },
    {
        path: '/login',
        element: <LoginPage/>
    }
]

export default routes