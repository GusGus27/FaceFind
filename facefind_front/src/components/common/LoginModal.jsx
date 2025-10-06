import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../../styles/common/LoginModal.css';

const LoginModal = ({ isOpen, onClose }) => {
  const { loginAsAdmin, loginAsUser } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState('user');

  if (!isOpen) return null;

  const handleLogin = () => {
    if (selectedRole === 'admin') {
      loginAsAdmin();
      navigate('/admin');
    } else {
      loginAsUser();
      navigate('/cases');
    }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h2>Iniciar Sesión</h2>
        <p>Selecciona tu tipo de usuario</p>
        
        <div className="login-options">
          <div
            className={`login-option ${selectedRole === 'user' ? 'active' : ''}`}
            onClick={() => setSelectedRole('user')}
          >
            <div className="option-icon">👤</div>
            <h3>Usuario</h3>
            <p>Acceso a casos y búsquedas</p>
          </div>
          
          <div
            className={`login-option ${selectedRole === 'admin' ? 'active' : ''}`}
            onClick={() => setSelectedRole('admin')}
          >
            <div className="option-icon">🔐</div>
            <h3>Administrador</h3>
            <p>Panel de control completo</p>
          </div>
        </div>

        <button className="btn-login-submit" onClick={handleLogin}>
          Ingresar como {selectedRole === 'admin' ? 'Administrador' : 'Usuario'}
        </button>
      </div>
    </div>
  );
};

export default LoginModal;
