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

      </Routes>
    </AuthProvider>
  );
}

export default App;