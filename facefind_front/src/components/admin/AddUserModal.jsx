import React, { useState, useEffect } from 'react';
import { createUser, checkBlacklist, getAllRoles } from '../../services/userService';
import '../../styles/admin/AddUserModal.css';

const AddUserModal = ({ isOpen, onClose, onAddUser, onReload }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    dni: '',
    role_id: null,
    password: ''
  });
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);

  // Cargar roles al abrir el modal
  useEffect(() => {
    if (isOpen) {
      loadRoles();
    }
  }, [isOpen]);

  const loadRoles = async () => {
    try {
      const rolesData = await getAllRoles();
      setRoles(rolesData);
      // Establecer rol por defecto (Usuario = id 2)
      if (rolesData.length > 0 && !formData.role_id) {
        const defaultRole = rolesData.find(r => r.nombre === 'Usuario') || rolesData[0];
        setFormData(prev => ({ ...prev, role_id: defaultRole.id }));
      }
    } catch (err) {
      console.error('Error loading roles:', err);
    }
  };

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (!formData.nombre || !formData.email || !formData.dni || !formData.password) {
      alert('Por favor completa todos los campos');
      return;
    }

    // Validar formato de DNI (8 dígitos)
    if (!/^\d{8}$/.test(formData.dni)) {
      alert('El DNI debe tener exactamente 8 dígitos');
      return;
    }

    // Validar formato de email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      alert('Por favor ingresa un email válido');
      return;
    }

    setLoading(true);

    try {
      // Verificar blacklist en el backend
      const blacklistCheck = await checkBlacklist({
        email: formData.email,
        dni: formData.dni
      });

      if (blacklistCheck.is_blacklisted) {
        alert(`No se puede registrar: ${blacklistCheck.reason}`);
        setLoading(false);
        return;
      }

      // Crear usuario
      await createUser(formData);

      alert('Usuario agregado exitosamente');

      // Limpiar formulario - establecer role_id por defecto
      const defaultRole = roles.find(r => r.nombre === 'Usuario') || roles[0];
      setFormData({
        nombre: '',
        email: '',
        dni: '',
        role_id: defaultRole?.id || 2,
        password: ''
      });

      // Recargar lista de usuarios
      if (onReload) {
        await onReload();
      }

      if (onAddUser) {
        onAddUser();
      }

      onClose();
    } catch (err) {
      console.error('Error creating user:', err);
      alert(err.message || 'Error al agregar usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    const defaultRole = roles.find(r => r.nombre === 'Usuario') || roles[0];
    setFormData({
      nombre: '',
      email: '',
      dni: '',
      role_id: defaultRole?.id || 2,
      password: ''
    });
    onClose();
  };

  return (
    <div className="add-user-modal">
      <div className="modal-overlay" onClick={handleClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Agregar Nuevo Usuario</h2>
            <button className="modal-close" onClick={handleClose}>&times;</button>
          </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="nombre">Nombre Completo</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              placeholder="Ingresa el nombre completo"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="usuario@ejemplo.com"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="dni">DNI</label>
            <input
              type="text"
              id="dni"
              name="dni"
              value={formData.dni}
              onChange={handleInputChange}
              placeholder="12345678"
              maxLength="8"
              pattern="\d{8}"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Contraseña temporal"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="role_id">Rol</label>
            <select
              id="role_id"
              name="role_id"
              value={formData.role_id || ''}
              onChange={handleInputChange}
              disabled={loading}
              required
            >
              <option value="">Selecciona un rol</option>
              {roles.map(role => (
                <option key={role.id} value={role.id}>{role.nombre}</option>
              ))}
            </select>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={handleClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Agregando...' : 'Agregar Usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
    </div>
  );
};

export default AddUserModal;
