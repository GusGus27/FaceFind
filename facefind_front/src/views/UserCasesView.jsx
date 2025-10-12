import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getCasosByUserId } from "../services/casoService";
import { getUserById } from "../services/userService";
import Header from "../components/common/Header";
import UserCaseCards from "../components/cases/UserCaseCards";
import FilterBar from "../components/cases/FilterBar";
import Pagination from "../components/cases/Pagination";
import '../styles/views/UserCasesView.css';

export default function UserCasesView() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cases, setCases] = useState([]);
  const [filteredCases, setFilteredCases] = useState([]);
  const [filter, setFilter] = useState("todos");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const perPage = 5;

  // Obtener usuario_id desde la tabla Usuario usando el email del auth
  useEffect(() => {
    const fetchUserId = async () => {
      if (user?.email) {
        try {
          // Buscar usuario en la BD por email de Supabase Auth
          const response = await fetch(`http://localhost:5000/users?search=${user.email}`);
          const result = await response.json();
          
          if (result.success && result.data.length > 0) {
            setUserId(result.data[0].id);
          }
        } catch (err) {
          console.error('Error fetching user ID:', err);
        }
      }
    };

    fetchUserId();
  }, [user]);

  // Cargar casos del usuario
  useEffect(() => {
    const loadUserCases = async () => {
      if (!userId) return;
      
      try {
        setLoading(true);
        setError(null);
        const casesData = await getCasosByUserId(userId);
        setCases(casesData);
        setFilteredCases(casesData);
      } catch (err) {
        console.error('Error loading cases:', err);
        setError('Error al cargar los casos. Intenta nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    loadUserCases();
  }, [userId]);

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

  const handleBackToHome = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="user-cases-container">
          <div className="loading-state">
            <p>Cargando casos...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="user-cases-container">
          <div className="error-state">
            <p>{error}</p>
            <button onClick={handleBackToHome} className="btn-back">
              ← Volver al Inicio
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="user-cases-container">
        <div className="user-cases-header">
          <button onClick={handleBackToHome} className="btn-back">
            ← Volver al Inicio
          </button>
          <h1 className="title">Mis Casos Activos</h1>
          <FilterBar filter={filter} setFilter={setFilter} />
        </div>

        {cases.length === 0 ? (
          <div className="empty-state">
            <p>No tienes casos registrados aún.</p>
            <button onClick={handleBackToHome} className="btn-primary">
              Registrar Nuevo Caso
            </button>
          </div>
        ) : (
          <>
            <UserCaseCards cases={paginatedCases} />

            <Pagination
              page={page}
              totalPages={totalPages}
              setPage={setPage}
            />
          </>
        )}
      </div>
    </>
  );
}
