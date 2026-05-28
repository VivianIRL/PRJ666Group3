import { StrictMode, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import TopNavbar from "./navigation/top-navbar.jsx";
import App from "./App.jsx";
import Login from "./register/Login.jsx";
import Register from "./register/Register.jsx";
import ImmigrationDetails from "./register/ImmigrationDetails.jsx";
import AboutPage from "./pages/Aboutpage.jsx";
import Community from "./pages/Community.jsx";
import ContentManagement from "./pages/ContentManagement.jsx";
import TaskManager from "./pages/TaskManager.jsx";
import Checklist from "./pages/Checklist.jsx";

import "./scss/App.scss";
import { UserContext } from "./UserContext.jsx";

export default function Center() {
  const [user, setUser] = useState("Test")

  return (
    <StrictMode>
        <UserContext.Provider value={{user, setUser}}>
        <BrowserRouter>
        <TopNavbar />
        <Routes>
            <Route path="/" element={<App />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/immigration" element={<ImmigrationDetails />} />
            <Route path="/community" element={<Community />} />
            <Route path="/content-management" element={<ContentManagement />} />
            <Route path="/tasks" element={<TaskManager />} />
            <Route path="/checklist" element={<Checklist />} />
        </Routes>
        </BrowserRouter>
        </UserContext.Provider>
    </StrictMode>
  );
}
