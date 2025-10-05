import React from "react";

export default function CaseCard({ caseData }) {
  const { title, img, status, description, lastUpdate } = caseData;

  return (
    <div className="case-card">
      <img src={img} alt={title} />
      <div className="case-card-body">
        <div className="case-title">{title}</div>
        <span className={`case-status ${status}`}>{status}</span>
        <p className="case-description">{description}</p>
        <p className="case-update">Última actualización: {lastUpdate}</p>
        <div className="case-footer">
          <button className="btn-outline">Ver Detalle</button>
          <button className="btn-secondary">Editar</button>
        </div>
      </div>
    </div>
  );
}
