import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CameraManager from '../components/camera/CameraManager';
import '../styles/camera/CameraManagement.css';

const CameraManagement = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  if (!isAdmin()) {
    return navigate('/', { replace: true });
  }

  return (
    <div className="camera-management">
      <div className="camera-management-header">
        <button className="back-button" onClick={() => navigate('/admin')}>
          ← Volver al Panel
        </button>
        <h1>Gestión de Cámaras</h1>
      </div>
      <div className="camera-management-content">
        <CameraManager />
      </div>
    </div>
  );
};

export default CameraManagement;