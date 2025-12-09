import { createBrowserRouter } from "react-router-dom";
import {Home} from './pages/home'
import {Login} from './pages/login'
import {Register} from './pages/register'
import {Dashboard} from './pages/dashboard'
import {New} from './pages/dashboard/new'
import {RoteadorDetail} from './pages/roteador'

import {Layout} from './components/layout'

const router = createBrowserRouter ([
  {
    element: <Layout/>, //esse componente Layout irá aparecer nas demais rotas abaixo
    children: [
      {
        path: "/",
        element: <Home/>
      },
      {
        path: "/roteador/:id",
        element: <RoteadorDetail/>
      },
      {
        path: "/dashboard",
        element: <Dashboard/>
      },
      {
        path: "/dashboard/new",
        element: <New/>
      },
    ]
  },
  { // essas duas rotas estão fora do Layout, não terá o mesmo
    path: "/login",
    element: <Login/>
  },
  {
    path: "/register",
    element: <Register/>
  }
])

export {router};