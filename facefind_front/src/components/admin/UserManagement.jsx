import React, { useState, useEffect } from 'react';
import AddUserModal from './AddUserModal';
import UserCasesModal from './UserCasesModal';
import '../../styles/admin/UserManagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('todos'); // todos, active, inactive, deleted
  const [showModal, setShowModal] = useState(false);
  const [showCasesModal, setShowCasesModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [bannedList, setBannedList] = useState([]); // Lista negra de DNI y emails
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;

  // Simulación de casos por usuario
  const [userCases, setUserCases] = useState({});

  useEffect(() => {
    // Simulación de usuarios con DNI y estados adicionales
    setUsers([
      { id: 1, name: 'Juan Pérez', email: 'juan@example.com', dni: '12345678', role: 'user', status: 'active', registeredDate: '2025-01-15', casesCount: 2 },
      { id: 2, name: 'María García', email: 'maria@example.com', dni: '87654321', role: 'user', status: 'active', registeredDate: '2025-02-20', casesCount: 1 },
      { id: 3, name: 'Carlos López', email: 'carlos@example.com', dni: '11223344', role: 'admin', status: 'active', registeredDate: '2024-12-10', casesCount: 0 },
      { id: 4, name: 'Ana Martínez', email: 'ana@example.com', dni: '44332211', role: 'user', status: 'inactive', registeredDate: '2025-03-05', casesCount: 2 },
      { id: 5, name: 'Pedro Sánchez', email: 'pedro@example.com', dni: '55667788', role: 'moderator', status: 'active', registeredDate: '2025-04-12', casesCount: 1 }
    ]);

    // Simulación de lista negra
    setBannedList([
      { dni: '99999999', email: 'banned@example.com', reason: 'Spam reiterado', bannedDate: '2025-03-01' }
    ]);

    // Simulación de casos de personas desaparecidas reportadas por usuarios
    // CONSISTENCIA: número de casos = casesCount
    setUserCases({
      1: [ // Juan Pérez - 2 casos (casesCount: 2)
        { id: 101, title: 'Desaparición de menor - Sofía Ramírez', status: 'activo', reportDate: '2025-01-20', location: 'Lima Centro', description: 'Niña de 8 años desaparecida en parque Kennedy. Última vez vista con uniforme escolar azul.' },
        { id: 102, title: 'Adulto mayor extraviado - Carlos Vega', status: 'resuelto', reportDate: '2025-02-10', location: 'Miraflores', description: 'Adulto mayor con Alzheimer. ENCONTRADO: Sistema detectó su rostro en Av. Larco el 15/02.' }
      ],
      2: [ // María García - 1 caso (casesCount: 1)
        { id: 201, title: 'Adolescente desaparecida - Ana Torres', status: 'activo', reportDate: '2025-03-01', location: 'Surco', description: 'Joven de 16 años no regresó del colegio. Sistema en búsqueda activa en zonas comerciales.' }
      ],
      // 3: Carlos López - 0 casos (casesCount: 0) - Administrador sin reportes
      4: [ // Ana Martínez - 2 casos (casesCount: 2)
        { id: 401, title: 'Persona desaparecida - Miguel Rojas', status: 'activo', reportDate: '2025-01-10', location: 'Callao', description: 'Hombre de 35 años desaparecido tras salir del trabajo. Familia solicita búsqueda urgente.' },
        { id: 402, title: 'Menor extraviado - Lucía Mendoza', status: 'pendiente', reportDate: '2025-03-15', location: 'Breña', description: 'Niña de 5 años perdida en centro comercial. En proceso de revisión de cámaras.' }
      ],
      5: [ // Pedro Sánchez - 1 caso (casesCount: 1)
        { id: 501, title: 'Desaparición sospechosa - Roberto Silva', status: 'activo', reportDate: '2025-04-10', location: 'San Juan de Lurigancho', description: 'Joven de 22 años desaparecido hace 3 días. Sistema FaceFind activado para reconocimiento.' }
      ]
    });
  }, []);

  const filteredUsers = users.filter(user => {
    // Búsqueda por nombre, email o DNI
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.dni.includes(searchTerm);
    
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    
    // Filtro de estado
    let matchesStatus;
    if (filterStatus === 'todos') {
      // "todos" muestra activos, inactivos y archivados (no baneados)
      matchesStatus = user.status === 'active' || user.status === 'inactive' || user.status === 'deleted';
    } else {
      matchesStatus = user.status === filterStatus;
    }
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Paginación
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleStatusToggle = (userId) => {
    setUsers(users.map(user =>
      user.id === userId
        ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
        : user
    ));
  };

  const handleRoleChange = (userId, newRole) => {
    setUsers(users.map(user =>
      user.id === userId ? { ...user, role: newRole } : user
    ));
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('¿Está seguro de archivar este usuario? Los datos se conservarán pero el usuario no podrá acceder.')) {
      // Soft delete: marcar como eliminado en lugar de borrar
      setUsers(users.map(user =>
        user.id === userId
          ? { 
              ...user, 
              status: 'deleted', 
              deletedAt: new Date().toISOString() 
            }
          : user
      ));
    }
  };

  const handleBanUser = (userId) => {
    const user = users.find(u => u.id === userId);
    const reason = prompt('Ingresa la razón del baneo:');
    
    if (!reason) {
      alert('Debes proporcionar una razón para el baneo');
      return;
    }

    if (window.confirm(`¿Está seguro de banear permanentemente a ${user.name}? Esta acción impedirá que vuelva a registrarse con su DNI y email.`)) {
      // Marcar usuario como baneado
      setUsers(users.map(u =>
        u.id === userId
          ? { 
              ...u, 
              status: 'banned', 
              bannedAt: new Date().toISOString(),
              banReason: reason
            }
          : u
      ));

      // Agregar DNI y email a lista negra
      setBannedList([...bannedList, {
        dni: user.dni,
        email: user.email,
        reason: reason,
        bannedDate: new Date().toISOString().split('T')[0],
        userName: user.name
      }]);

      alert(`Usuario ${user.name} baneado exitosamente`);
    }
  };

  const handleRestoreUser = (userId) => {
    if (window.confirm('¿Está seguro de restaurar este usuario?')) {
      setUsers(users.map(user =>
        user.id === userId
          ? { 
              ...user, 
              status: 'active', 
              deletedAt: null 
            }
          : user
      ));
    }
  };

  const handleAddUser = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  // Función para ver casos de un usuario
  const handleViewCases = (user) => {
    setSelectedUser(user);
    setShowCasesModal(true);
  };

  const handleCloseCasesModal = () => {
    setShowCasesModal(false);
    setSelectedUser(null);
  };

  const handleSubmitUser = (userData) => {
    // Validar que no esté en lista negra
    const isBlacklisted = bannedList.some(
      banned => banned.dni === userData.dni || banned.email === userData.email
    );

    if (isBlacklisted) {
      alert('Este DNI o email está en la lista negra y no puede ser registrado');
      return;
    }

    // Validar que no exista usuario con mismo DNI o email
    const duplicateExists = users.some(
      user => user.dni === userData.dni || user.email === userData.email
    );

    if (duplicateExists) {
      alert('Ya existe un usuario con este DNI o email');
      return;
    }

    // Crear nuevo usuario
    const newUserData = {
      id: users.length + 1,
      name: userData.name,
      email: userData.email,
      dni: userData.dni,
      role: userData.role,
      status: 'active',
      registeredDate: new Date().toISOString().split('T')[0],
      casesCount: 0
    };

    setUsers([...users, newUserData]);
    handleCloseModal();
    alert('Usuario agregado exitosamente');
  };

  return (
    <div className="user-management">
      <div className="management-header">
        <h1>Gestión de Usuarios</h1>
        <button className="btn-primary" onClick={handleAddUser}>+ Agregar Usuario</button>
      </div>

      <div className="management-filters">
        <input
          type="text"
          placeholder="Buscar por nombre, email o DNI..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="filter-select"
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
        >
          <option value="all">Todos los roles</option>
          <option value="admin">Administrador</option>
          <option value="moderator">Moderador</option>
          <option value="user">Usuario</option>
        </select>
        <select
          className="filter-select"
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value);
            setCurrentPage(1); // Reset a página 1 al cambiar filtro
          }}
        >
          <option value="todos">Ver Todos</option>
          <option value="active">Ver Activos</option>
          <option value="inactive">Ver Inactivos</option>
          <option value="deleted">Ver Archivados</option>
        </select>
      </div>

      <div className="users-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>DNI</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Casos</th>
              <th>Fecha de Registro</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.length === 0 ? (
              <tr>
                <td colSpan="9" className="empty-message">
                  Vacío
                </td>
              </tr>
            ) : (
              currentUsers.map(user => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.dni}</td>
                  <td>
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    className="role-select"
                    disabled={user.status === 'deleted' || user.status === 'banned'}
                  >
                    <option value="user">Usuario</option>
                    <option value="moderator">Moderador</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td>
                  <span className={`status-badge ${user.status}`}>
                    {user.status === 'active' && 'Activo'}
                    {user.status === 'inactive' && 'Inactivo'}
                    {user.status === 'deleted' && 'Archivado'}
                    {user.status === 'banned' && 'Baneado'}
                  </span>
                </td>
                <td>
                  <button 
                    className="btn-cases"
                    onClick={() => handleViewCases(user)}
                    title={`Ver ${user.casesCount} casos de ${user.name}`}
                  >
                    📋 {user.casesCount}
                  </button>
                </td>
                <td>{user.registeredDate}</td>
                <td>
                  <div className="action-buttons">
                    {user.status === 'deleted' ? (
                      <button
                        className="btn-restore"
                        onClick={() => handleRestoreUser(user.id)}
                        title="Restaurar usuario"
                      >
                        ♻️
                      </button>
                    ) : user.status === 'banned' ? (
                      <span className="banned-label">🚫</span>
                    ) : (
                      <>
                        <button
                          className="btn-toggle"
                          onClick={() => handleStatusToggle(user.id)}
                          title={user.status === 'active' ? 'Suspender' : 'Activar'}
                        >
                          {user.status === 'active' ? '🔒' : '🔓'}
                        </button>
                        <button
                          className="btn-ban"
                          onClick={() => handleBanUser(user.id)}
                          title="Banear permanentemente"
                        >
                          🚫
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDeleteUser(user.id)}
                          title="Archivar usuario"
                        >
                          🗑️
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            className="pagination-btn"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            ← Anterior
          </button>
          <div className="pagination-numbers">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
              <button
                key={number}
                className={`pagination-number ${currentPage === number ? 'active' : ''}`}
                onClick={() => handlePageChange(number)}
              >
                {number}
              </button>
            ))}
          </div>
          <button 
            className="pagination-btn"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Siguiente →
          </button>
        </div>
      )}

      <div className="users-summary">
        <p>Mostrando {currentUsers.length} de <strong>{filteredUsers.length}</strong> usuarios</p>
        <p>En lista negra: <strong>{bannedList.length}</strong></p>
      </div>

      {/* Sección de Lista Negra */}
      {bannedList.length > 0 && (
        <div className="blacklist-section">
          <h2>📛 Lista Negra (DNI y Emails Baneados)</h2>
          <div className="blacklist-table">
            <table>
              <thead>
                <tr>
                  <th>DNI</th>
                  <th>Email</th>
                  <th>Usuario</th>
                  <th>Razón</th>
                  <th>Fecha de Baneo</th>
                </tr>
              </thead>
              <tbody>
                {bannedList.map((banned, index) => (
                  <tr key={index}>
                    <td>{banned.dni}</td>
                    <td>{banned.email}</td>
                    <td>{banned.userName || 'N/A'}</td>
                    <td>{banned.reason}</td>
                    <td>{banned.bannedDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal para agregar usuario */}
      <AddUserModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onAddUser={handleSubmitUser}
      />

      {/* Modal para ver casos del usuario */}
      <UserCasesModal
        isOpen={showCasesModal}
        onClose={handleCloseCasesModal}
        userName={selectedUser?.name}
        userId={selectedUser?.id}
        cases={selectedUser ? (userCases[selectedUser.id] || []) : []}
      />
    </div>
  );
};

export default UserManagement;
