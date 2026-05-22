import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import TopNavbar from "./navigation/top-navbar.jsx";
import App from './App.jsx'
import Login from './register/Login.jsx';
import Register from './register/Register.jsx';
import ImmigrationDetails from './register/ImmigrationDetails.jsx';
import { BrowserRouter, Route, Routes } from "react-router-dom";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
        <TopNavbar />
        <Routes>
            <Route path="/" element={<App />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/immigration" element={<ImmigrationDetails />} />
        </Routes>
    </BrowserRouter>
  </StrictMode>,
)
