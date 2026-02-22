import { createBrowserRouter } from "react-router-dom";
import {Home} from './pages/home'
import {Login} from './pages/login'
import {Register} from './pages/register'
import {Dashboard} from './pages/dashboard'
import {New} from './pages/dashboard/new'
import {RoteadorDetail} from './pages/roteador'

import {Layout} from './components/layout'
import {Private} from './routes/Private'

const router = createBrowserRouter ([
  {
    element: <Layout/>, //esse componente Layout irá aparecer nas demais rotas abaixo
    children: [
      // {
      //   path: "/",
      //   element: <Login/>
      // },
       {
         path: "/home",
         element: <Private><Home/></Private>
       },
      {
        path: "/roteador/:id",
        element: <RoteadorDetail/>
      },
      {
        path: "/dashboard",
        element: <Private><Dashboard/></Private>
      },
      {
        path: "/dashboard/new",
        element: <Private><New/></Private>
      },
    ]
  },
   { // essas duas rotas estão fora do Layout, não terá o mesmo
     path: "/",
     element: <Login/>
   },
   {
    path: "/login",
    element: <Login/>
   },
   {
     path: "/register",
     element: <Register/>
   }
])

export {router};