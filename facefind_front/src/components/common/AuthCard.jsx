import React from 'react';

const AuthCard = ({
  leftTitle,
  leftLead,
  leftNote,
  leftButtonLabel,
  onLeftButton,
  rightTitle,
  children,
}) => {
  return (
    <div className="login-container">
      <div className="login-card">
        <div className="left-panel">
          <div className="left-inner">
            <h1>{leftTitle}</h1>
            {leftLead && <p className="lead">{leftLead}</p>}
            <div className="notienescuenta">
                {leftNote && <p className="no-account">{leftNote}</p>}
                {leftButtonLabel && (
                <button className="btn-outline" onClick={onLeftButton}>{leftButtonLabel}</button>
                )}
            </div>
          </div>
        </div>

        <div className="right-panel">
          <div className="right-inner">
            <h2>{rightTitle}</h2>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthCard;
