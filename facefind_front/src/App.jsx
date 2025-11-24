import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
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
import AboutPage from './views/AboutPage';
import StatisticsPage from './views/StatisticsPage';
import ContactPage from './views/ContactPage';
import MapView from './components/admin/MapView';
import AlertScheduleConfig from './views/AlertScheduleConfig';
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
      
      {/* Rutas públicas informativas */}
      <Route path="/acerca-de" element={<AboutPage />} />
      <Route path="/estadisticas" element={<StatisticsPage />} />
      <Route path="/contacto" element={<ContactPage />} />
      
      {/* Rutas protegidas - requieren autenticación */}
      <Route path="/registrar_caso" element={
        <ProtectedRoute>
          <CaseRegistration />
        </ProtectedRoute>
      } />
      <Route path="/casos" element={
        <ProtectedRoute>
          <UserCasesView />
        </ProtectedRoute>
      } />
      <Route path="/casos/:caseId/editar" element={
        <ProtectedRoute>
          <EditCasePage />
        </ProtectedRoute>
      } />
      <Route path="/admin" element={
        <ProtectedRoute>
          <AdminPanel />
        </ProtectedRoute>
      } />
      <Route path="/admin/casos/:caseId/editar" element={
        <ProtectedRoute>
          <AdminEditCasePage />
        </ProtectedRoute>
      } />
      <Route path="/admin/camera" element={
        <ProtectedRoute>
          <CameraManagement />
        </ProtectedRoute>
      } />
      <Route path="/admin/mapa" element={
        <ProtectedRoute>
          <MapView />
        </ProtectedRoute>
      } />
      <Route path="/admin/horarios-alertas" element={
        <ProtectedRoute>
          <AlertScheduleConfig />
        </ProtectedRoute>
      } />
    </Routes>
  );
}
export default App;

// Nota: El AuthProvider se ha movido a main.jsx para envolver toda la aplicación
// y proporcionar el contexto de autenticación a todos los componentes y vistas.