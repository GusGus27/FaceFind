import React from 'react';

const PasswordStrengthIndicator = ({ password, strength }) => {
  if (!password) return null;

  return (
    <div className="password-strength">
      <div className="strength-bar">
        <div 
          className="strength-bar-fill" 
          style={{ 
            width: `${(strength.score / 5) * 100}%`,
            backgroundColor: strength.color
          }}
        />
      </div>
      <small className="strength-text" style={{ color: strength.color }}>
        Fortaleza: {strength.message}
      </small>
    </div>
  );
};

export default PasswordStrengthIndicator;
