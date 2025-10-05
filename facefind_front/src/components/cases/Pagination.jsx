import React from "react";

export default function Pagination({ page, totalPages, setPage }) {
  if (totalPages <= 1) return null;

  return (
    <div className="pagination">
      <button disabled={page === 1} onClick={() => setPage(page - 1)}>
        ← Anterior
      </button>
      <span>Página {page} de {totalPages}</span>
      <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>
        Siguiente →
      </button>
    </div>
  );
}
