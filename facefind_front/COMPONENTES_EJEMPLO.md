# 📦 Componentes de Ejemplo para Supabase

Esta guía muestra cómo crear componentes completos usando los servicios y hooks de Supabase.

## 📑 Índice

- [Componente de Upload de Fotos](#upload-de-fotos)
- [Lista de Casos con Filtros](#lista-de-casos)
- [Panel de Alertas en Tiempo Real](#panel-de-alertas)
- [Formulario de Crear Caso Completo](#crear-caso-completo)
- [Panel de Notificaciones](#panel-de-notificaciones)
- [Dashboard con Estadísticas](#dashboard)

---

## 📸 Upload de Fotos

Componente para subir las 3 fotos requeridas (frontal, izquierda, derecha).

```jsx
// src/components/fotos/UploadFoto.jsx
import { useState } from 'react';
import * as fotoService from '../../services/fotoService';
import { FOTO_ANGULO } from '../../constants/enums';

export const UploadFoto = ({ casoId, onComplete }) => {
  const [fotos, setFotos] = useState({
    [FOTO_ANGULO.FRONTAL]: null,
    [FOTO_ANGULO.IZQUIERDO]: null,
    [FOTO_ANGULO.DERECHO]: null,
  });
  const [previews, setPreviews] = useState({});
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({});

  const handleFileSelect = (angulo, file) => {
    setFotos(prev => ({ ...prev, [angulo]: file }));

    // Crear preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviews(prev => ({ ...prev, [angulo]: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const uploadFoto = async (angulo, file) => {
    try {
      setProgress(prev => ({ ...prev, [angulo]: 'uploading' }));

      await fotoService.uploadAndSaveFoto(file, casoId, angulo, {
        uploaded_at: new Date().toISOString()
      });

      setProgress(prev => ({ ...prev, [angulo]: 'success' }));
    } catch (error) {
      setProgress(prev => ({ ...prev, [angulo]: 'error' }));
      throw error;
    }
  };

  const handleUploadAll = async () => {
    setUploading(true);

    try {
      const uploads = Object.entries(fotos)
        .filter(([_, file]) => file !== null)
        .map(([angulo, file]) => uploadFoto(angulo, file));

      await Promise.all(uploads);

      alert('¡Todas las fotos subidas exitosamente!');
      onComplete?.();
    } catch (error) {
      alert('Error al subir fotos: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-fotos-container">
      <h3>Subir Fotos de Referencia</h3>
      <p>Se requieren 3 fotos: frontal, izquierda y derecha</p>

      <div className="fotos-grid">
        {Object.values(FOTO_ANGULO).map(angulo => (
          <div key={angulo} className="foto-upload-card">
            <h4>{angulo}</h4>

            {previews[angulo] ? (
              <div className="preview">
                <img src={previews[angulo]} alt={angulo} />
                <button
                  onClick={() => {
                    setFotos(prev => ({ ...prev, [angulo]: null }));
                    setPreviews(prev => ({ ...prev, [angulo]: null }));
                  }}
                  className="btn-remove"
                >
                  ✕
                </button>
              </div>
            ) : (
              <label className="upload-area">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileSelect(angulo, e.target.files[0])}
                  disabled={uploading}
                />
                <div className="upload-placeholder">
                  📷 Seleccionar foto
                </div>
              </label>
            )}

            {progress[angulo] && (
              <div className={`status status-${progress[angulo]}`}>
                {progress[angulo] === 'uploading' && '⏳ Subiendo...'}
                {progress[angulo] === 'success' && '✓ Completado'}
                {progress[angulo] === 'error' && '✗ Error'}
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={handleUploadAll}
        disabled={uploading || Object.values(fotos).every(f => f === null)}
        className="btn btn-primary"
      >
        {uploading ? 'Subiendo...' : 'Subir Fotos'}
      </button>
    </div>
  );
};
```

---

## 📋 Lista de Casos con Filtros

```jsx
// src/components/casos/ListaCasos.jsx
import { useCasos } from '../../hooks/useCasos';
import { CASO_STATUS, CASO_PRIORITY } from '../../constants/enums';
import { CasoCard } from './CasoCard';

export const ListaCasos = () => {
  const {
    casos,
    loading,
    error,
    filters,
    filterByStatus,
    filterByPriority,
    searchByName,
    clearFilters
  } = useCasos({ autoLoad: true });

  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      searchByName(searchTerm);
    }
  };

  if (loading) {
    return <div className="loading">Cargando casos...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="casos-container">
      {/* Barra de Filtros */}
      <div className="filters-bar">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit">🔍</button>
        </form>

        <div className="filter-buttons">
          <label>Estado:</label>
          {Object.entries(CASO_STATUS).map(([key, value]) => (
            <button
              key={value}
              onClick={() => filterByStatus(value)}
              className={filters.status === value ? 'active' : ''}
            >
              {key}
            </button>
          ))}
        </div>

        <div className="filter-buttons">
          <label>Prioridad:</label>
          {Object.entries(CASO_PRIORITY).map(([key, value]) => (
            <button
              key={value}
              onClick={() => filterByPriority(value)}
              className={filters.priority === value ? 'active' : ''}
            >
              {key}
            </button>
          ))}
        </div>

        <button onClick={clearFilters} className="btn-clear">
          Limpiar Filtros
        </button>
      </div>

      {/* Lista de Casos */}
      <div className="casos-grid">
        {casos.length === 0 ? (
          <p>No se encontraron casos</p>
        ) : (
          casos.map(caso => (
            <CasoCard key={caso.id} caso={caso} />
          ))
        )}
      </div>
    </div>
  );
};

// src/components/casos/CasoCard.jsx
export const CasoCard = ({ caso }) => {
  return (
    <div className="caso-card">
      <h3>{caso.nombre_completo}</h3>
      <p className="edad">{caso.age} años</p>
      <p className="desaparicion">
        Desaparecido: {new Date(caso.fecha_desaparicion).toLocaleDateString()}
      </p>
      <p className="ubicacion">📍 {caso.lugar_desaparicion}</p>

      <div className="badges">
        <span className={`badge priority-${caso.priority}`}>
          {caso.priority}
        </span>
        <span className={`badge status-${caso.status}`}>
          {caso.status}
        </span>
      </div>

      <a href={`/casos/${caso.id}`} className="btn-ver">
        Ver Detalles
      </a>
    </div>
  );
};
```

---

## 🚨 Panel de Alertas en Tiempo Real

```jsx
// src/components/alertas/AlertasList.jsx
import { useAlertas } from '../../hooks/useAlertas';
import { useEffect, useState } from 'react';
import { AlertaCard } from './AlertaCard';

export const AlertasList = () => {
  const {
    alertas,
    loading,
    nuevaAlerta,
    fetchPendingAlertas,
    markAsReviewed,
    markAsFalsePositive
  } = useAlertas({
    autoLoad: true,
    realtime: true  // ← Habilita tiempo real
  });

  const [showNewAlert, setShowNewAlert] = useState(false);

  // Notificación cuando llega nueva alerta
  useEffect(() => {
    if (nuevaAlerta) {
      setShowNewAlert(true);

      // Reproducir sonido
      const audio = new Audio('/alert-sound.mp3');
      audio.play();

      // Ocultar después de 5 segundos
      setTimeout(() => setShowNewAlert(false), 5000);
    }
  }, [nuevaAlerta]);

  return (
    <div className="alertas-container">
      <div className="header">
        <h2>Alertas en Tiempo Real</h2>
        <button onClick={fetchPendingAlertas} className="btn-refresh">
          🔄 Actualizar
        </button>
      </div>

      {/* Banner de Nueva Alerta */}
      {showNewAlert && (
        <div className="new-alert-banner">
          🚨 ¡Nueva alerta detectada! - ID: {nuevaAlerta.id}
        </div>
      )}

      {/* Lista de Alertas */}
      <div className="alertas-list">
        {loading ? (
          <p>Cargando...</p>
        ) : alertas.length === 0 ? (
          <p>No hay alertas pendientes</p>
        ) : (
          alertas.map(alerta => (
            <AlertaCard
              key={alerta.id}
              alerta={alerta}
              onMarkReviewed={() => markAsReviewed(alerta.id)}
              onMarkFalsePositive={() => markAsFalsePositive(alerta.id)}
            />
          ))
        )}
      </div>
    </div>
  );
};

// src/components/alertas/AlertaCard.jsx
export const AlertaCard = ({ alerta, onMarkReviewed, onMarkFalsePositive }) => {
  return (
    <div className={`alerta-card priority-${alerta.prioridad.toLowerCase()}`}>
      <div className="alerta-header">
        <h4>Alerta #{alerta.id}</h4>
        <span className={`badge ${alerta.estado}`}>{alerta.estado}</span>
      </div>

      <div className="alerta-body">
        <p><strong>Caso:</strong> {alerta.Caso?.nombre_completo}</p>
        <p><strong>Cámara:</strong> {alerta.Camara?.ubicacion}</p>
        <p>
          <strong>Similitud:</strong>
          <span className="similitud">{(alerta.similitud * 100).toFixed(2)}%</span>
        </p>
        <p><strong>Prioridad:</strong> {alerta.prioridad}</p>
        <p className="timestamp">
          {new Date(alerta.timestamp).toLocaleString()}
        </p>
      </div>

      {alerta.estado === 'PENDIENTE' && (
        <div className="alerta-actions">
          <button
            onClick={onMarkReviewed}
            className="btn btn-success"
          >
            ✓ Marcar Revisada
          </button>
          <button
            onClick={onMarkFalsePositive}
            className="btn btn-warning"
          >
            ✗ Falso Positivo
          </button>
        </div>
      )}
    </div>
  );
};
```

---

## 📝 Formulario Crear Caso Completo

```jsx
// src/components/casos/CrearCasoForm.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as casoService from '../../services/casoService';
import * as fotoService from '../../services/fotoService';
import { useAuth } from '../../hooks/useAuth';
import {
  CASO_PRIORITY,
  GENDER,
  FOTO_ANGULO,
  RELATIONSHIP_TYPES
} from '../../constants/enums';

export const CrearCasoForm = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    // Información Personal
    nombre_completo: '',
    fecha_nacimiento: '',
    age: '',
    gender: GENDER.PREFIERO_NO_DECIR,
    altura: '',
    peso: '',
    skinColor: '',
    hairColor: '',
    eyeColor: '',
    senas_particulares: '',

    // Desaparición
    fecha_desaparicion: '',
    disappearanceTime: '',
    lugar_desaparicion: '',
    lastSeenLocation: '',
    lastSeen: '',
    circumstances: '',
    clothing: '',

    // Detalles del Caso
    title: '',
    description: '',
    priority: CASO_PRIORITY.MEDIUM,

    // Información del Reportante
    reporterName: '',
    relationship: '',
    contactPhone: '',
    contactEmail: '',
    additionalContact: '',

    // Observaciones
    observaciones: '',
  });

  const [fotos, setFotos] = useState({
    [FOTO_ANGULO.FRONTAL]: null,
    [FOTO_ANGULO.IZQUIERDO]: null,
    [FOTO_ANGULO.DERECHO]: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (angulo, file) => {
    setFotos(prev => ({ ...prev, [angulo]: file }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Crear el caso
      const caso = await casoService.createCaso({
        ...formData,
        usuario_id: profile.id,
      });

      // 2. Subir las fotos
      const uploadPromises = Object.entries(fotos)
        .filter(([_, file]) => file !== null)
        .map(([angulo, file]) =>
          fotoService.uploadAndSaveFoto(file, caso.id, angulo)
        );

      await Promise.all(uploadPromises);

      alert('Caso creado exitosamente!');
      navigate(`/casos/${caso.id}`);

    } catch (error) {
      alert('Error al crear el caso: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="crear-caso-container">
      <h2>Registrar Nuevo Caso</h2>

      {/* Stepper */}
      <div className="stepper">
        <div className={step >= 1 ? 'active' : ''}>1. Personal</div>
        <div className={step >= 2 ? 'active' : ''}>2. Desaparición</div>
        <div className={step >= 3 ? 'active' : ''}>3. Contacto</div>
        <div className={step >= 4 ? 'active' : ''}>4. Fotos</div>
      </div>

      <form onSubmit={handleSubmit} className="caso-form">
        {/* STEP 1: Información Personal */}
        {step === 1 && (
          <div className="form-step">
            <h3>Información Personal</h3>

            <input
              type="text"
              name="nombre_completo"
              placeholder="Nombre completo *"
              value={formData.nombre_completo}
              onChange={handleChange}
              required
            />

            <input
              type="date"
              name="fecha_nacimiento"
              placeholder="Fecha de nacimiento *"
              value={formData.fecha_nacimiento}
              onChange={handleChange}
              required
            />

            <input
              type="number"
              name="age"
              placeholder="Edad"
              value={formData.age}
              onChange={handleChange}
            />

            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
            >
              {Object.entries(GENDER).map(([key, value]) => (
                <option key={value} value={value}>{key}</option>
              ))}
            </select>

            <input
              type="number"
              step="0.01"
              name="altura"
              placeholder="Altura (m)"
              value={formData.altura}
              onChange={handleChange}
            />

            <input
              type="number"
              step="0.1"
              name="peso"
              placeholder="Peso (kg)"
              value={formData.peso}
              onChange={handleChange}
            />

            <input
              type="text"
              name="skinColor"
              placeholder="Color de piel"
              value={formData.skinColor}
              onChange={handleChange}
            />

            <input
              type="text"
              name="hairColor"
              placeholder="Color de cabello"
              value={formData.hairColor}
              onChange={handleChange}
            />

            <input
              type="text"
              name="eyeColor"
              placeholder="Color de ojos"
              value={formData.eyeColor}
              onChange={handleChange}
            />

            <textarea
              name="senas_particulares"
              placeholder="Señas particulares"
              value={formData.senas_particulares}
              onChange={handleChange}
              rows="3"
            />

            <button type="button" onClick={() => setStep(2)}>
              Siguiente →
            </button>
          </div>
        )}

        {/* STEP 2: Desaparición */}
        {step === 2 && (
          <div className="form-step">
            <h3>Información de Desaparición</h3>

            <input
              type="date"
              name="fecha_desaparicion"
              placeholder="Fecha de desaparición *"
              value={formData.fecha_desaparicion}
              onChange={handleChange}
              required
            />

            <input
              type="time"
              name="disappearanceTime"
              placeholder="Hora aproximada"
              value={formData.disappearanceTime}
              onChange={handleChange}
            />

            <input
              type="text"
              name="lugar_desaparicion"
              placeholder="Lugar de desaparición *"
              value={formData.lugar_desaparicion}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="lastSeenLocation"
              placeholder="Última ubicación conocida"
              value={formData.lastSeenLocation}
              onChange={handleChange}
            />

            <input
              type="text"
              name="lastSeen"
              placeholder="Última vez visto con..."
              value={formData.lastSeen}
              onChange={handleChange}
            />

            <textarea
              name="circumstances"
              placeholder="Circunstancias de la desaparición"
              value={formData.circumstances}
              onChange={handleChange}
              rows="3"
            />

            <textarea
              name="clothing"
              placeholder="Vestimenta"
              value={formData.clothing}
              onChange={handleChange}
              rows="2"
            />

            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
            >
              {Object.entries(CASO_PRIORITY).map(([key, value]) => (
                <option key={value} value={value}>{key}</option>
              ))}
            </select>

            <div className="step-buttons">
              <button type="button" onClick={() => setStep(1)}>
                ← Anterior
              </button>
              <button type="button" onClick={() => setStep(3)}>
                Siguiente →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Contacto */}
        {step === 3 && (
          <div className="form-step">
            <h3>Información de Contacto</h3>

            <input
              type="text"
              name="reporterName"
              placeholder="Nombre del reportante"
              value={formData.reporterName}
              onChange={handleChange}
            />

            <select
              name="relationship"
              value={formData.relationship}
              onChange={handleChange}
            >
              <option value="">Relación con la persona</option>
              {Object.entries(RELATIONSHIP_TYPES).map(([key, value]) => (
                <option key={key} value={value}>{value}</option>
              ))}
            </select>

            <input
              type="tel"
              name="contactPhone"
              placeholder="Teléfono de contacto *"
              value={formData.contactPhone}
              onChange={handleChange}
              required
            />

            <input
              type="email"
              name="contactEmail"
              placeholder="Email de contacto"
              value={formData.contactEmail}
              onChange={handleChange}
            />

            <input
              type="text"
              name="additionalContact"
              placeholder="Contacto adicional"
              value={formData.additionalContact}
              onChange={handleChange}
            />

            <textarea
              name="observaciones"
              placeholder="Observaciones adicionales"
              value={formData.observaciones}
              onChange={handleChange}
              rows="4"
            />

            <div className="step-buttons">
              <button type="button" onClick={() => setStep(2)}>
                ← Anterior
              </button>
              <button type="button" onClick={() => setStep(4)}>
                Siguiente →
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Fotos */}
        {step === 4 && (
          <div className="form-step">
            <h3>Fotos de Referencia</h3>
            <p>Se requieren 3 fotos: frontal, izquierda y derecha</p>

            <div className="fotos-upload">
              {Object.values(FOTO_ANGULO).map(angulo => (
                <div key={angulo} className="foto-input">
                  <label>{angulo} *</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(angulo, e.target.files[0])}
                    required
                  />
                  {fotos[angulo] && <span>✓ {fotos[angulo].name}</span>}
                </div>
              ))}
            </div>

            <div className="step-buttons">
              <button type="button" onClick={() => setStep(3)}>
                ← Anterior
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-submit"
              >
                {loading ? 'Creando...' : 'Crear Caso'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
```

---

## 🔔 Panel de Notificaciones

```jsx
// src/components/notificaciones/NotificationPanel.jsx
import { useNotificaciones } from '../../hooks/useNotificaciones';
import { useAuth } from '../../hooks/useAuth';
import { useState } from 'react';

export const NotificationPanel = () => {
  const { profile } = useAuth();
  const {
    notificaciones,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotificaciones(profile?.id, {
    autoLoad: true,
    realtime: true
  });

  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div className="notification-panel">
      <button
        className="notification-bell"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        🔔
        {unreadCount > 0 && (
          <span className="badge">{unreadCount}</span>
        )}
      </button>

      {showDropdown && (
        <div className="notification-dropdown">
          <div className="dropdown-header">
            <h3>Notificaciones</h3>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="btn-mark-all">
                Marcar todas como leídas
              </button>
            )}
          </div>

          <div className="notification-list">
            {loading ? (
              <p>Cargando...</p>
            ) : notificaciones.length === 0 ? (
              <p>No hay notificaciones</p>
            ) : (
              notificaciones.map(notif => (
                <div
                  key={notif.id}
                  className={`notification-item ${!notif.isRead ? 'unread' : ''} severity-${notif.severity}`}
                  onClick={() => !notif.isRead && markAsRead(notif.id)}
                >
                  <div className="notif-header">
                    <strong>{notif.title}</strong>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notif.id);
                      }}
                      className="btn-delete"
                    >
                      ✕
                    </button>
                  </div>
                  <p>{notif.message}</p>
                  <small>
                    {new Date(notif.timestamp).toLocaleString()}
                  </small>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
```

---

## 📊 Dashboard con Estadísticas

```jsx
// src/components/dashboard/Dashboard.jsx
import { useEffect, useState } from 'react';
import { useCasos } from '../../hooks/useCasos';
import { useAlertas } from '../../hooks/useAlertas';
import * as casoService from '../../services/casoService';
import * as alertaService from '../../services/alertaService';

export const Dashboard = () => {
  const { casos } = useCasos({ autoLoad: true });
  const { alertas } = useAlertas({ autoLoad: true });

  const [stats, setStats] = useState({
    casos: {},
    alertas: {}
  });

  useEffect(() => {
    const loadStats = async () => {
      const casoStats = await casoService.getCasoStats();
      const alertaStats = await alertaService.getAlertaStats();

      setStats({
        casos: casoStats,
        alertas: alertaStats
      });
    };

    loadStats();
  }, []);

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>

      {/* Métricas Generales */}
      <div className="metrics-grid">
        <div className="metric-card">
          <h3>Total Casos</h3>
          <div className="metric-value">{stats.casos.total || 0}</div>
        </div>

        <div className="metric-card">
          <h3>Casos Activos</h3>
          <div className="metric-value">
            {stats.casos.byStatus?.activo || 0}
          </div>
        </div>

        <div className="metric-card">
          <h3>Alertas Pendientes</h3>
          <div className="metric-value">
            {stats.alertas.byEstado?.PENDIENTE || 0}
          </div>
        </div>

        <div className="metric-card">
          <h3>Casos Resueltos</h3>
          <div className="metric-value">
            {stats.casos.byStatus?.resuelto || 0}
          </div>
        </div>
      </div>

      {/* Casos Recientes */}
      <div className="recent-section">
        <h2>Casos Recientes</h2>
        <div className="casos-list">
          {casos.slice(0, 5).map(caso => (
            <div key={caso.id} className="caso-item">
              <h4>{caso.nombre_completo}</h4>
              <p>{caso.lugar_desaparicion}</p>
              <span className={`badge ${caso.status}`}>{caso.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Alertas Recientes */}
      <div className="recent-section">
        <h2>Alertas Recientes</h2>
        <div className="alertas-list">
          {alertas.slice(0, 5).map(alerta => (
            <div key={alerta.id} className="alerta-item">
              <h4>Alerta #{alerta.id}</h4>
              <p>Similitud: {(alerta.similitud * 100).toFixed(2)}%</p>
              <span className={`badge ${alerta.prioridad}`}>
                {alerta.prioridad}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
```

---

## 🎨 Estilos CSS de Ejemplo

```css
/* Colores para badges */
.badge.priority-urgent { background: #dc3545; color: white; }
.badge.priority-high { background: #fd7e14; color: white; }
.badge.priority-medium { background: #ffc107; color: black; }
.badge.priority-low { background: #6c757d; color: white; }

.badge.status-activo { background: #28a745; color: white; }
.badge.status-pendiente { background: #ffc107; color: black; }
.badge.status-resuelto { background: #17a2b8; color: white; }

.badge.PENDIENTE { background: #ffc107; color: black; }
.badge.REVISADA { background: #28a745; color: white; }
.badge.FALSO_POSITIVO { background: #6c757d; color: white; }

/* Notificaciones */
.notification-item.unread {
  background: #e3f2fd;
  font-weight: bold;
}

.severity-urgent { border-left: 4px solid #dc3545; }
.severity-high { border-left: 4px solid #fd7e14; }
.severity-medium { border-left: 4px solid #ffc107; }
.severity-low { border-left: 4px solid #6c757d; }

/* Upload de fotos */
.fotos-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.upload-area {
  border: 2px dashed #ccc;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}

.upload-area:hover {
  border-color: #007bff;
  background: #f8f9fa;
}

/* Loading states */
.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}

.error {
  color: #dc3545;
  padding: 1rem;
  background: #f8d7da;
  border-radius: 4px;
}
```

---

¡Todos los componentes están listos para usar! 🎉

Solo necesitas importarlos en tus vistas y agregarles estilos CSS.
