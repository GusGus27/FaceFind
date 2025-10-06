import React from "react";

export default function FilterBar({ filter, setFilter }) {
  return (
    <select
      className="filter-select"
      value={filter}
      onChange={(e) => setFilter(e.target.value)}
    >
      <option value="todos">Todos</option>
      <option value="activo">Activos</option>
      <option value="pendiente">Pendientes</option>
      <option value="resuelto">Resueltos</option>
    </select>
  );
}
