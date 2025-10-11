import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LandingPage from './views/LandingPage';
import Login from './views/Login';
import Register from './views/Register';
import ForgotPassword from './views/ForgotPassword';
import ResetPassword from './views/ResetPassword';
import EmailVerification from './views/EmailVerification';
import UserCasesView from './views/UserCasesView';
import AdminPanel from './views/AdminPanel';
import EditCasePage from './components/cases/EditCasePage';
import AdminEditCasePage from './components/admin/AdminEditCasePage';


import CaseRegistration from './views/CaseRegistration';
import CameraManagement from './views/CameraManagement';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/verify-email/:token" element={<EmailVerification />} />
      <Route path="/casos" element={<UserCasesView />} />
      <Route path="/admin" element={<AdminPanel />} />
      <Route path="/casos/:caseId/editar" element={<EditCasePage />} />
      <Route path="/admin/casos/:caseId/editar" element={<AdminEditCasePage />} />
      <Route path="/admin/camera" element={<CameraManagement />} />
      <Route path="/registrar_caso" element={<CaseRegistration />} />
    </Routes>
  );
}
export default App;

// Nota: El AuthProvider se ha movido a main.jsx para envolver toda la aplicación
// y proporcionar el contexto de autenticación a todos los componentes y vistas.