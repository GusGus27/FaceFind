import React, { useState, useEffect } from "react";
import Header from "../components/common/Header";
import UserCaseCards from "../components/cases/UserCaseCards";
import FilterBar from "../components/cases/FilterBar";
import Pagination from "../components/cases/Pagination";
import '../styles/views/UserCasesView.css';

export default function UserCasesView() {
  const [cases, setCases] = useState([]);
  const [filteredCases, setFilteredCases] = useState([]);
  const [filter, setFilter] = useState("todos");
  const [page, setPage] = useState(1);
  const perPage = 5;

  useEffect(() => {
    // Simulación: datos del backend basados en el esquema de DB
    const mockCases = [
      { 
        id: 1, 
        nombre_completo: "María García López", 
        title: "Desaparición en zona centro",
        status: "activo", 
        priority: "alta",
        fecha_desaparicion: "2025-10-01",
        lugar_desaparicion: "Centro Comercial Plaza Mayor, Lima",
        updated_at: "2025-10-11",
        img: "https://i.pravatar.cc/150?img=1",
        description: "Mi hermana desapareció el 1 de octubre. La vi por última vez saliendo del centro comercial Plaza Mayor."
      },
      { 
        id: 2, 
        nombre_completo: "Carlos Mendoza Ruiz", 
        title: "Persona extraviada en parque",
        status: "pendiente", 
        priority: "media",
        fecha_desaparicion: "2025-09-28",
        lugar_desaparicion: "Parque Kennedy, Miraflores",
        updated_at: "2025-10-10",
        img: "https://i.pravatar.cc/150?img=12",
        description: "Mi padre salió a caminar por el Parque Kennedy y no regresó. Necesito ayuda para encontrarlo."
      },
      { 
        id: 3, 
        nombre_completo: "Ana Sofía Torres", 
        title: "Caso resuelto - Persona localizada",
        status: "resuelto", 
        priority: "baja",
        fecha_desaparicion: "2025-09-25",
        lugar_desaparicion: "Universidad Nacional, San Miguel",
        updated_at: "2025-09-30",
        img: "https://i.pravatar.cc/150?img=5",
        description: "¡Gracias a todos! Ana fue encontrada sana y salva. El sistema funcionó perfectamente."
      },
      { 
        id: 4, 
        nombre_completo: "Roberto Castillo Pérez", 
        title: "Desaparición en zona industrial",
        status: "activo", 
        priority: "alta",
        fecha_desaparicion: "2025-10-05",
        lugar_desaparicion: "Zona Industrial Callao",
        updated_at: "2025-10-11",
        img: "https://i.pravatar.cc/150?img=8",
        description: "Mi esposo no regresó del trabajo hace 6 días. Salió de la zona industrial del Callao y desapareció."
      },
      { 
        id: 5, 
        nombre_completo: "Lucía Fernández Vega", 
        title: "Menor desaparecida",
        status: "activo", 
        priority: "alta",
        fecha_desaparicion: "2025-10-08",
        lugar_desaparicion: "Colegio Santa Rosa, San Isidro",
        updated_at: "2025-10-11",
        img: "https://i.pravatar.cc/150?img=9",
        description: "¡URGENTE! Mi hija de 15 años no regresó del colegio. Por favor ayúdenme a encontrarla."
      },
      { 
        id: 6, 
        nombre_completo: "Jorge Luis Ramírez", 
        title: "Desaparición voluntaria",
        status: "pendiente", 
        priority: "media",
        fecha_desaparicion: "2025-09-20",
        lugar_desaparicion: "Surco, Lima",
        updated_at: "2025-10-09",
        img: "https://i.pravatar.cc/150?img=13",
        description: "Mi hermano desapareció hace 3 semanas. Su familia lo está buscando desesperadamente."
      },
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

        <UserCaseCards cases={paginatedCases} />

        <Pagination
          page={page}
          totalPages={totalPages}
          setPage={setPage}
        />
      </div>
    </>
  );
}
