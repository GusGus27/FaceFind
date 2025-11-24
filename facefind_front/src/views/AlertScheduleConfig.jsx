import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Clock, 
  Save, 
  ArrowLeft, 
  Bell, 
  Camera,
  AlertTriangle,
  CheckCircle,
  Settings
} from 'lucide-react';
import DayScheduleEditor from '../components/admin/DayScheduleEditor';
import ExceptionManager from '../components/admin/ExceptionManager';
import OffHoursLogs from '../components/admin/OffHoursLogs';
import {
  getSchedules,
  createSchedule,
  updateSchedule,
  addException,
  removeException
} from '../services/scheduleService';
import { getAllCameras } from '../services/cameraService';
import '../styles/AlertScheduleConfig.css';

const AlertScheduleConfig = () => {
  const navigate = useNavigate();
  const [cameras, setCameras] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [selectedScheduleId, setSelectedScheduleId] = useState(null);
  const [currentSchedule, setCurrentSchedule] = useState(null);
  const [activeTab, setActiveTab] = useState('schedule'); // schedule, exceptions, logs
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedScheduleId) {
      const schedule = schedules.find(s => s.id === selectedScheduleId);
      setCurrentSchedule(schedule);
    }
  }, [selectedScheduleId, schedules]);

  const loadData = async () => {
    try {
      // Cargar horarios
      const loadedSchedules = getSchedules();
      setSchedules(loadedSchedules);
      
      if (loadedSchedules.length > 0) {
        setSelectedScheduleId(loadedSchedules[0].id);
      }

      // Cargar cámaras (simulado)
      const mockCameras = [
        { id: 'cam1', nombre: 'Cámara Entrada Principal', ubicacion: 'Entrada' },
        { id: 'cam2', nombre: 'Cámara Estacionamiento', ubicacion: 'Exterior' },
        { id: 'cam3', nombre: 'Cámara Recepción', ubicacion: 'Interior' }
      ];
      setCameras(mockCameras);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      showMessage('Error al cargar datos', 'error');
    }
  };

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleCreateNewSchedule = () => {
    const newSchedule = {
      name: 'Nuevo Horario',
      cameraId: null,
      days: {
        monday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
        tuesday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
        wednesday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
        thursday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
        friday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
        saturday: { enabled: false, slots: [] },
        sunday: { enabled: false, slots: [] }
      },
      exceptions: [],
      criticalOverride: true
    };

    const result = createSchedule(newSchedule);
    if (result.success) {
      setSchedules([...schedules, result.schedule]);
      setSelectedScheduleId(result.schedule.id);
      showMessage('Horario creado exitosamente');
    } else {
      showMessage('Error al crear horario', 'error');
    }
  };

  const handleSaveSchedule = () => {
    if (!currentSchedule) return;

    setIsSaving(true);
    const result = updateSchedule(currentSchedule.id, currentSchedule);
    
    setTimeout(() => {
      setIsSaving(false);
      if (result.success) {
        const updatedSchedules = schedules.map(s => 
          s.id === currentSchedule.id ? result.schedule : s
        );
        setSchedules(updatedSchedules);
        showMessage('Horario guardado exitosamente');
      } else {
        showMessage('Error al guardar horario', 'error');
      }
    }, 500);
  };

  const handleDayUpdate = (dayName, daySchedule) => {
    setCurrentSchedule({
      ...currentSchedule,
      days: {
        ...currentSchedule.days,
        [dayName]: daySchedule
      }
    });
  };

  const handleAddException = (exceptionData) => {
    const result = addException(currentSchedule.id, exceptionData);
    if (result.success) {
      setCurrentSchedule(result.schedule);
      const updatedSchedules = schedules.map(s => 
        s.id === currentSchedule.id ? result.schedule : s
      );
      setSchedules(updatedSchedules);
      showMessage('Excepción agregada exitosamente');
    } else {
      showMessage('Error al agregar excepción', 'error');
    }
  };

  const handleRemoveException = (date) => {
    const result = removeException(currentSchedule.id, date);
    if (result.success) {
      setCurrentSchedule(result.schedule);
      const updatedSchedules = schedules.map(s => 
        s.id === currentSchedule.id ? result.schedule : s
      );
      setSchedules(updatedSchedules);
      showMessage('Excepción eliminada exitosamente');
    } else {
      showMessage('Error al eliminar excepción', 'error');
    }
  };

  const handleScheduleNameChange = (newName) => {
    setCurrentSchedule({
      ...currentSchedule,
      name: newName
    });
  };

  const handleCameraChange = (cameraId) => {
    setCurrentSchedule({
      ...currentSchedule,
      cameraId: cameraId || null
    });
  };

  const handleCriticalOverrideChange = (enabled) => {
    setCurrentSchedule({
      ...currentSchedule,
      criticalOverride: enabled
    });
  };

  return (
    <div className="alert-schedule-config">
      <div className="config-header">
        <div className="header-left">
          <button onClick={() => navigate(-1)} className="btn-back">
            <ArrowLeft size={20} />
          </button>
          <h1>
            <Clock size={28} />
            Configuración de Horarios de Alertas
          </h1>
        </div>
        <button 
          onClick={handleSaveSchedule} 
          className="btn-save-main"
          disabled={isSaving || !currentSchedule}
        >
          <Save size={20} />
          {isSaving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>

      {message && (
        <div className={`message-banner ${message.type}`}>
          {message.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
          {message.text}
        </div>
      )}

      <div className="config-container">
        <aside className="config-sidebar">
          <div className="sidebar-header">
            <h3>Horarios Configurados</h3>
            <button onClick={handleCreateNewSchedule} className="btn-new-schedule">
              Nuevo +
            </button>
          </div>
          <div className="schedules-list">
            {schedules.map(schedule => (
              <div
                key={schedule.id}
                className={`schedule-item ${selectedScheduleId === schedule.id ? 'active' : ''}`}
                onClick={() => setSelectedScheduleId(schedule.id)}
              >
                <div className="schedule-item-header">
                  <span className="schedule-name">{schedule.name}</span>
                </div>
                <div className="schedule-item-info">
                  {schedule.cameraId ? (
                    <span className="camera-info">
                      <Camera size={12} />
                      {cameras.find(c => c.id === schedule.cameraId)?.nombre || schedule.cameraId}
                    </span>
                  ) : (
                    <span className="global-info">
                      <Settings size={12} />
                      Global
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </aside>

        <main className="config-main">
          {currentSchedule ? (
            <>
              <div className="config-tabs">
                <button
                  className={`tab ${activeTab === 'schedule' ? 'active' : ''}`}
                  onClick={() => setActiveTab('schedule')}
                >
                  <Clock size={16} />
                  Horarios Semanales
                </button>
                <button
                  className={`tab ${activeTab === 'exceptions' ? 'active' : ''}`}
                  onClick={() => setActiveTab('exceptions')}
                >
                  <AlertTriangle size={16} />
                  Excepciones
                </button>
                <button
                  className={`tab ${activeTab === 'logs' ? 'active' : ''}`}
                  onClick={() => setActiveTab('logs')}
                >
                  <Bell size={16} />
                  Logs
                </button>
              </div>

              <div className="config-content">
                {activeTab === 'schedule' && (
                  <div className="schedule-config">
                    <div className="schedule-settings">
                      <div className="setting-group">
                        <label>Nombre del Horario</label>
                        <input
                          type="text"
                          value={currentSchedule.name}
                          onChange={(e) => handleScheduleNameChange(e.target.value)}
                          className="setting-input"
                          placeholder="Ej: Horario Oficina"
                        />
                      </div>

                      <div className="setting-group">
                        <label>Aplicar a Cámara</label>
                        <select
                          value={currentSchedule.cameraId || ''}
                          onChange={(e) => handleCameraChange(e.target.value)}
                          className="setting-select"
                        >
                          <option value="">Global (Todas las cámaras)</option>
                          {cameras.map(camera => (
                            <option key={camera.id} value={camera.id}>
                              {camera.nombre}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="setting-group checkbox-group">
                        <label>
                          <input
                            type="checkbox"
                            checked={currentSchedule.criticalOverride}
                            onChange={(e) => handleCriticalOverrideChange(e.target.checked)}
                          />
                          <span>Permitir alertas críticas fuera de horario</span>
                        </label>
                        <small>Las alertas marcadas como críticas se enviarán siempre, sin importar el horario</small>
                      </div>
                    </div>

                    <div className="days-schedule">
                      <h3>Configuración por Día</h3>
                      {Object.keys(currentSchedule.days).map(dayName => (
                        <DayScheduleEditor
                          key={dayName}
                          dayName={dayName}
                          daySchedule={currentSchedule.days[dayName]}
                          onUpdate={(updatedDay) => handleDayUpdate(dayName, updatedDay)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'exceptions' && (
                  <ExceptionManager
                    exceptions={currentSchedule.exceptions}
                    onAddException={handleAddException}
                    onRemoveException={handleRemoveException}
                  />
                )}

                {activeTab === 'logs' && (
                  <OffHoursLogs />
                )}
              </div>
            </>
          ) : (
            <div className="no-schedule-selected">
              <Clock size={60} />
              <p>Selecciona un horario o crea uno nuevo</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AlertScheduleConfig;
