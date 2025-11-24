import React, { useState } from 'react';
import { Calendar, Plus, Trash2, AlertTriangle } from 'lucide-react';
import '../../styles/ExceptionManager.css';

const ExceptionManager = ({ exceptions = [], onAddException, onRemoveException }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newException, setNewException] = useState({
    date: '',
    enabled: true,
    reason: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newException.date) {
      onAddException(newException);
      setNewException({ date: '', enabled: true, reason: '' });
      setShowAddForm(false);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const sortedExceptions = [...exceptions].sort((a, b) => 
    new Date(a.date) - new Date(b.date)
  );

  return (
    <div className="exception-manager">
      <div className="exception-header">
        <h3>
          <Calendar size={20} />
          Excepciones de Calendario
        </h3>
        <button 
          onClick={() => setShowAddForm(!showAddForm)} 
          className="btn-add-exception"
        >
          <Plus size={16} />
          Nueva Excepción
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="exception-form">
          <div className="form-group">
            <label>Fecha</label>
            <input
              type="date"
              value={newException.date}
              onChange={(e) => setNewException({ ...newException, date: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Estado</label>
            <select
              value={newException.enabled ? 'enabled' : 'disabled'}
              onChange={(e) => setNewException({ 
                ...newException, 
                enabled: e.target.value === 'enabled' 
              })}
              className="form-select"
            >
              <option value="enabled">Alertas Activadas</option>
              <option value="disabled">Alertas Desactivadas</option>
            </select>
          </div>

          <div className="form-group">
            <label>Motivo (opcional)</label>
            <input
              type="text"
              value={newException.reason}
              onChange={(e) => setNewException({ ...newException, reason: e.target.value })}
              placeholder="Ej: Día festivo, mantenimiento..."
              className="form-input"
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-save">
              Guardar Excepción
            </button>
            <button 
              type="button" 
              onClick={() => setShowAddForm(false)} 
              className="btn-cancel"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="exceptions-list">
        {sortedExceptions.length === 0 ? (
          <div className="no-exceptions">
            <AlertTriangle size={40} />
            <p>No hay excepciones configuradas</p>
            <small>Las excepciones permiten modificar el comportamiento en fechas específicas</small>
          </div>
        ) : (
          sortedExceptions.map((exception, index) => (
            <div key={index} className={`exception-item ${exception.enabled ? 'enabled' : 'disabled'}`}>
              <div className="exception-info">
                <div className="exception-date">
                  <Calendar size={16} />
                  {formatDate(exception.date)}
                </div>
                <div className="exception-status">
                  {exception.enabled ? (
                    <span className="status-badge enabled">Alertas Activas</span>
                  ) : (
                    <span className="status-badge disabled">Alertas Desactivadas</span>
                  )}
                </div>
                {exception.reason && (
                  <div className="exception-reason">{exception.reason}</div>
                )}
              </div>
              <button
                onClick={() => onRemoveException(exception.date)}
                className="btn-remove-exception"
                title="Eliminar excepción"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ExceptionManager;
