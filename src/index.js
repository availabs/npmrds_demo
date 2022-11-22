import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'
import {
  createBrowserRouter,
  RouterProvider
} from "react-router-dom";

import {
  FalcorProvider, 
  falcorGraph
} from "modules/avl-falcor"

import routes from  "./routes";
import Layout from './layout'
import ErrorPage from './pages/error_page'

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: routes
    
  }
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <FalcorProvider falcor={ falcorGraph('https://graph.availabs.org') }>
      <RouterProvider router={router} />
    </FalcorProvider>
  </React.StrictMode>
);

// import reportWebVitals from './reportWebVitals';
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();

