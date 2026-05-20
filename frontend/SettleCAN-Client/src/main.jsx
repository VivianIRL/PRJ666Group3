import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import TopNavbar from "./navigation/top-navbar.jsx";
import App from './App.jsx'
import Login from './register/Login.jsx';
import { BrowserRouter, Route, Routes } from "react-router-dom";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
        <TopNavbar />
        <Routes>
            <Route path="/" element={<App />} />
            <Route path="/login" element={<Login />} />
        </Routes>
    </BrowserRouter>
  </StrictMode>,
)
