import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './styles/global.css'
import { getRedirectResult } from "firebase/auth";
import { auth } from "./firebase";
import { useEffect } from "react";

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
)

useEffect(() => {
  getRedirectResult(auth)
    .then((result) => {
      if (result?.user) {
        console.log("Usuario login:", result.user);
      }
    })
    .catch(console.error);
}, []);