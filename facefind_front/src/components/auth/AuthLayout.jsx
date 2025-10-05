import React from 'react';
import '../../styles/auth/AuthLayout.css';

const AuthLayout = ({ children, welcomePanel }) => {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-welcome-panel">
          {welcomePanel}
        </div>
        <div className="auth-form-panel">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
