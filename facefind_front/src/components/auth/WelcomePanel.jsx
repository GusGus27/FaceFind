import React from 'react';
import { Link } from 'react-router-dom';

const WelcomePanel = ({ title, subtitle, actionText, actionLink, actionLabel }) => {
  return (
    <div className="welcome-content">
      <div className="welcome-icon">
        <img
          src="https://cdn-icons-png.flaticon.com/512/6537/6537387.png"
          alt="Facial recognition"
          loading="lazy"
          style={{ width: 120, height: 120, objectFit: 'contain' }}
        />
      </div>

      <h1>{title}</h1>
      <p>{subtitle}</p>
      {actionText && actionLink && (
        <div className="welcome-action">
          <p className="welcome-action-text">{actionText}</p>
          <Link to={actionLink} className="welcome-action-link">
            {actionLabel}
          </Link>
        </div>
      )}
    </div>
  );
};

export default WelcomePanel;
