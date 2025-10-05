import React from "react";
import CaseCard from "./CaseCard";

export default function CaseList({ cases }) {
  if (cases.length === 0)
    return <p style={{ textAlign: "center", color: "#6b7280" }}>No hay casos disponibles.</p>;

  return (
    <div className="cases-grid">
      {cases.map((c) => (
        <CaseCard key={c.id} caseData={c} />
      ))}
    </div>
  );
}
