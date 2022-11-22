import {
  NavLink,
  Outlet
} from "react-router-dom";

import routes from  "./routes";


const Nav = () => (
  <div className='w-full bg-slate-800 shadow-lg'>
    <nav className='max-w-7xl mx-auto p-4 '>
      {routes
        .filter(route => route.mainNav)
        .map((route,i) => 
          <NavLink 
            key={i} 
            to={route.path}
            className={({ isActive }) => `p-4 border-b-2 border-slate-800
              ${isActive ? 'text-sky-500 border-sky-500' :'text-slate-400 hover:text-slate-100' } 
               font-light `
            }
          >
            {route.name}
          </NavLink>)
      }
    </nav>
  </div>
)

const Layout = ({routes}) =>
  <div className='flex flex-col h-full' >
      <Nav routes={routes} />  
      <div className='flex-1'>
        <Outlet />
      </div>
  </div>

export default Layout