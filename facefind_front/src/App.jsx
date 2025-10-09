import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LandingPage from './views/LandingPage';
import Login from './views/Login';
import Register from './views/Register';
import UserCasesView from './views/UserCasesView';
import AdminPanel from './views/AdminPanel';
import EditCasePage from './components/CaseEdit/EditCasePage';
import AdminEditCasePage from './components/CaseEdit/AdminEditCasePage';


import CaseRegistration from './views/CaseRegistration';
import CameraManagement from './views/CameraManagement';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/casos" element={<UserCasesView />} />
        <Route path="/admin" element={<AdminPanel />} />
        {/* Ruta para usuarios */}
        <Route path="/casos/:caseId/editar" element={<EditCasePage />} />
        {/* Rutas para administradores */}
        <Route path="/admin/casos/:caseId/editar" element={<AdminEditCasePage />} />

        <Route path="/admin/camera" element={<CameraManagement />} />
        <Route path="/registrar_caso" element={<CaseRegistration />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;