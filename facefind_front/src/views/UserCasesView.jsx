import React, { useState, useEffect } from "react";
import Header from "../components/common/Header";
import CaseList from "../components/cases/CaseList";
import FilterBar from "../components/cases/FilterBar";
import Pagination from "../components/cases/Pagination";
import '../styles/views/UserCasesView.css';

export default function UserCasesView() {
  const [cases, setCases] = useState([]);
  const [filteredCases, setFilteredCases] = useState([]);
  const [filter, setFilter] = useState("todos");
  const [page, setPage] = useState(1);
  const perPage = 4;

  useEffect(() => {
    // Simulación: datos del backend
    const mockCases = [
      { id: 1, title: "Robo de bicicleta", status: "activo", lastUpdate: "2025-10-02", img: "https://placekitten.com/300/200", description: "Caso abierto en comisaría local." },
      { id: 2, title: "Pérdida de documento", status: "pendiente", lastUpdate: "2025-09-28", img: "https://placekitten.com/301/200", description: "En espera de confirmación." },
      { id: 3, title: "Vehículo recuperado", status: "resuelto", lastUpdate: "2025-09-30", img: "https://placekitten.com/302/200", description: "Caso cerrado con éxito." },
      { id: 4, title: "Fraude en línea", status: "activo", lastUpdate: "2025-10-01", img: "https://placekitten.com/303/200", description: "Investigación en curso." },
      { id: 5, title: "Daños a propiedad", status: "pendiente", lastUpdate: "2025-10-03", img: "https://placekitten.com/304/200", description: "Pendiente de revisión policial." },
    ];
    setCases(mockCases);
    setFilteredCases(mockCases);
  }, []);

  // Filtrado
  useEffect(() => {
    if (filter === "todos") setFilteredCases(cases);
    else setFilteredCases(cases.filter((c) => c.status === filter));
    setPage(1);
  }, [filter, cases]);

  // Paginación
  const startIndex = (page - 1) * perPage;
  const paginatedCases = filteredCases.slice(startIndex, startIndex + perPage);
  const totalPages = Math.ceil(filteredCases.length / perPage);

  return (
    <>
      <Header />
      <div className="user-cases-container">
        <div className="user-cases-header">
          <h1 className="title">Casos Activos del Usuario</h1>
          <FilterBar filter={filter} setFilter={setFilter} />
        </div>

        <CaseList cases={paginatedCases} />

        <Pagination
          page={page}
          totalPages={totalPages}
          setPage={setPage}
        />
      </div>
    </>
  );
}
