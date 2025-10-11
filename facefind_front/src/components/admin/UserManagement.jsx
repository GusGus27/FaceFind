import React, { useState, useEffect } from 'react';
import AddUserModal from './AddUserModal';
import EditUserModal from './EditUserModal';
import UserCasesModal from './UserCasesModal';
import { 
  getUsersWithCases, 
  activateUser, 
  deactivateUser, 
  updateUser as updateUserService,
  getBlacklist 
} from '../../services/userService';
import '../../styles/admin/UserManagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('todos'); // todos, active, inactive
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCasesModal, setShowCasesModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userToEdit, setUserToEdit] = useState(null);
  const [bannedList, setBannedList] = useState([]); // Lista negra de usuarios inactivos
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const usersPerPage = 5;

  // Cargar usuarios y lista negra desde la API
  useEffect(() => {
    loadUsers();
    loadBlacklist();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const usersData = await getUsersWithCases();
      setUsers(usersData);
    } catch (err) {
      console.error('Error loading users:', err);
      setError('Error al cargar usuarios. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const loadBlacklist = async () => {
    try {
      const blacklistData = await getBlacklist();
      setBannedList(blacklistData);
    } catch (err) {
      console.error('Error loading blacklist:', err);
    }
  };

  const filteredUsers = users.filter(user => {
    // Búsqueda por nombre, email o DNI
    const matchesSearch = 
      user.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.dni?.includes(searchTerm);
    
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    
    // Filtro de estado
    let matchesStatus;
    if (filterStatus === 'todos') {
      matchesStatus = true; // Mostrar todos
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

  const handleStatusToggle = async (userId) => {
    try {
      const user = users.find(u => u.id === userId);
      
      if (user.status === 'active') {
        await deactivateUser(userId);
        alert('Usuario desactivado correctamente');
      } else {
        await activateUser(userId);
        alert('Usuario activado correctamente');
      }
      
      // Recargar usuarios
      await loadUsers();
      await loadBlacklist();
    } catch (err) {
      console.error('Error toggling user status:', err);
      alert('Error al cambiar el estado del usuario');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUserService(userId, { role: newRole });
      
      // Actualizar localmente
      setUsers(users.map(user =>
        user.id === userId ? { ...user, role: newRole } : user
      ));
      
      alert('Rol actualizado correctamente');
    } catch (err) {
      console.error('Error updating role:', err);
      alert('Error al actualizar el rol');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('¿Está seguro de desactivar este usuario? No podrá volver a usar el mismo DNI o email.')) {
      try {
        await deactivateUser(userId);
        alert('Usuario desactivado correctamente');
        await loadUsers();
        await loadBlacklist();
      } catch (err) {
        console.error('Error deleting user:', err);
        alert('Error al desactivar usuario');
      }
    }
  };

  const handleRestoreUser = async (userId) => {
    if (window.confirm('¿Está seguro de restaurar este usuario?')) {
      try {
        await activateUser(userId);
        alert('Usuario restaurado correctamente');
        await loadUsers();
        await loadBlacklist();
      } catch (err) {
        console.error('Error restoring user:', err);
        alert('Error al restaurar usuario');
      }
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

  // Función para abrir modal de edición
  const handleEditUser = (user) => {
    setUserToEdit(user);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setUserToEdit(null);
  };

  // Función para actualizar usuario
  const handleUpdateUser = async (updatedData) => {
    try {
      await updateUserService(userToEdit.id, updatedData);
      
      alert('Usuario actualizado exitosamente');
      handleCloseEditModal();
      await loadUsers();
    } catch (err) {
      console.error('Error updating user:', err);
      const errorMessage = err.message || 'Error al actualizar usuario';
      alert(errorMessage);
    }
  };

  const handleSubmitUser = async (userData) => {
    try {
      // La validación de blacklist se hace en el backend
      // AddUserModal llamará directamente al servicio
      await loadUsers();
      handleCloseModal();
    } catch (err) {
      console.error('Error in handleSubmitUser:', err);
    }
  };

  if (loading) {
    return <div className="user-management loading">Cargando usuarios...</div>;
  }

  if (error) {
    return (
      <div className="user-management error">
        <p>{error}</p>
        <button onClick={loadUsers}>Reintentar</button>
      </div>
    );
  }

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
              <th>Casos</th>
              <th>Fecha de Registro</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.length === 0 ? (
              <tr>
                <td colSpan="8" className="empty-message">
                  Vacío
                </td>
              </tr>
            ) : (
              currentUsers.map(user => (
                <tr key={user.id} className={user.status === 'inactive' ? 'inactive-row' : ''}>
                  <td>{user.id}</td>
                  <td>{user.nombre}</td>
                  <td>{user.email}</td>
                  <td>{user.dni || 'N/A'}</td>
                  <td>
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    className="role-select"
                    disabled={user.status === 'inactive'}
                  >
                    <option value="user">Usuario</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td>
                  <button 
                    className="btn-cases"
                    onClick={() => handleViewCases(user)}
                    title={`Ver ${user.cases_count || 0} casos de ${user.nombre}`}
                  >
                    📋 {user.cases_count || 0}
                  </button>
                </td>
                <td>{user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</td>
                <td>
                  <div className="action-buttons">
                    {user.status === 'inactive' ? (
                      <button
                        className="btn-restore"
                        onClick={() => handleRestoreUser(user.id)}
                        title="Activar usuario"
                      >
                        🔓
                      </button>
                    ) : (
                      <>
                        <button
                          className="btn-edit"
                          onClick={() => handleEditUser(user)}
                          title="Editar usuario"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-toggle"
                          onClick={() => handleStatusToggle(user.id)}
                          title="Desactivar (agregar a lista negra)"
                        >
                          �
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
        <p>En lista negra (Inactivos): <strong>{bannedList.length}</strong></p>
      </div>

      {/* Sección de Lista Negra */}
      {bannedList.length > 0 && (
        <div className="blacklist-section">
          <h2>📛 Lista Negra (Usuarios Inactivos)</h2>
          <p className="blacklist-description">
            Los usuarios en lista negra no pueden volver a registrarse con su DNI o email.
          </p>
          <div className="blacklist-table">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>DNI</th>
                  <th>Email</th>
                  <th>Fecha de Desactivación</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {bannedList.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.nombre}</td>
                    <td>{user.dni || 'N/A'}</td>
                    <td>{user.email}</td>
                    <td>{user.updated_at ? new Date(user.updated_at).toLocaleDateString() : 'N/A'}</td>
                    <td>
                      <button
                        className="btn-restore"
                        onClick={() => handleRestoreUser(user.id)}
                        title="Reactivar usuario"
                      >
                        🔓 Reactivar
                      </button>
                    </td>
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
        onReload={loadUsers}
      />

      {/* Modal para editar usuario */}
      <EditUserModal
        isOpen={showEditModal}
        onClose={handleCloseEditModal}
        onUpdateUser={handleUpdateUser}
        user={userToEdit}
      />

      {/* Modal para ver casos del usuario */}
      <UserCasesModal
        isOpen={showCasesModal}
        onClose={handleCloseCasesModal}
        userName={selectedUser?.nombre}
        userId={selectedUser?.id}
      />
    </div>
  );
};

export default UserManagement;
