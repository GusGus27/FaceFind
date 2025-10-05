import React, { useState, useEffect } from 'react';
import '../../styles/UserManagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  useEffect(() => {
    // Simulación de usuarios
    setUsers([
      { id: 1, name: 'Juan Pérez', email: 'juan@example.com', role: 'user', status: 'active', registeredDate: '2025-01-15' },
      { id: 2, name: 'María García', email: 'maria@example.com', role: 'user', status: 'active', registeredDate: '2025-02-20' },
      { id: 3, name: 'Carlos López', email: 'carlos@example.com', role: 'admin', status: 'active', registeredDate: '2024-12-10' },
      { id: 4, name: 'Ana Martínez', email: 'ana@example.com', role: 'user', status: 'inactive', registeredDate: '2025-03-05' },
      { id: 5, name: 'Pedro Sánchez', email: 'pedro@example.com', role: 'moderator', status: 'active', registeredDate: '2025-04-12' }
    ]);
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

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
    if (window.confirm('¿Está seguro de eliminar este usuario?')) {
      setUsers(users.filter(user => user.id !== userId));
    }
  };

  return (
    <div className="user-management">
      <div className="management-header">
        <h1>Gestión de Usuarios</h1>
        <button className="btn-primary" onClick={() => {/* Lógica para agregar usuario */}}>+ Agregar Usuario</button>
      </div>

      <div className="management-filters">
        <input
          type="text"
          placeholder="Buscar por nombre o email..."
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
      </div>

      <div className="users-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Fecha de Registro</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    className="role-select"
                  >
                    <option value="user">Usuario</option>
                    <option value="moderator">Moderador</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td>
                  <span className={`status-badge ${user.status}`}>
                    {user.status === 'active' ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td>{user.registeredDate}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn-toggle"
                      onClick={() => handleStatusToggle(user.id)}
                    >
                      {user.status === 'active' ? '🔒' : '🔓'}
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="users-summary">
        <p>Total de usuarios: <strong>{filteredUsers.length}</strong></p>
      </div>
    </div>
  );
};

export default UserManagement;
