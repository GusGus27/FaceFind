import React, { useState, useEffect } from "react";
import { getFotosByCaso } from "../../services/fotoService";
import "../../styles/views/UserCasesView.css";

export default function CaseCard({ caseData }) {
  const { id, title, img, status, description, lastUpdate } = caseData;
  const [photoUrl, setPhotoUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPhoto = async () => {
      try {
        const fotos = await getFotosByCaso(id);
        if (fotos && fotos.length > 0) {
          setPhotoUrl(fotos[0].url_foto);
        }
      } catch (error) {
        console.error(`Error cargando foto del caso ${id}:`, error);
      } finally {
        setLoading(false);
      }
    };

    loadPhoto();
  }, [id]);

  // Prioridad: foto cargada > img del caso > fallback
  const displayImage = photoUrl || img || "https://static.vecteezy.com/system/resources/previews/011/269/772/non_2x/missing-person-icon-design-free-vector.jpg";

  return (
    <div className="case-card">
      <img src={displayImage} alt={title} />
      <div className="case-card-body">
        <div className="case-title">{title}</div>
        <span className={`case-status ${status}`}>{status}</span>
        <p className="case-description">{description}</p>
        <p className="case-update">Última actualización: {lastUpdate}</p>
        <div className="case-footer">
          <button className="btn-outline">Ver Detalle</button>
         <button
          className="btn-secondary"
          onClick={() => window.location.href = "http://localhost:5173/casos/1/editar"}
        >
        Editar
        </button>
        </div>
      </div>
    </div>
  );
}
