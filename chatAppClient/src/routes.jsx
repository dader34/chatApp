import ChatApp from "./App"
import ChatHome from "./pages/ChatHome"
import ErrorPage from "./pages/ErrorPage"

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
        ]
    }
]

export default routes