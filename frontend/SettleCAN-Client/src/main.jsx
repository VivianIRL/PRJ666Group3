import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import TopNavbar from "./navigation/top-navbar.jsx";
import App from "./App.jsx";
import Login from "./register/Login.jsx";
import Register from "./register/Register.jsx";
import ImmigrationDetails from "./register/ImmigrationDetails.jsx";
import AboutPage from "./pages/Aboutpage.jsx";

import "./scss/App.scss";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <TopNavbar />
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/immigration" element={<ImmigrationDetails />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
