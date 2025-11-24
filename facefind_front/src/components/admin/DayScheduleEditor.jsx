import React, { useState } from 'react';
import { Clock, Plus, Trash2 } from 'lucide-react';
import '../../styles/DayScheduleEditor.css';

const DAYS = {
  monday: 'Lunes',
  tuesday: 'Martes',
  wednesday: 'Miércoles',
  thursday: 'Jueves',
  friday: 'Viernes',
  saturday: 'Sábado',
  sunday: 'Domingo'
};

const DayScheduleEditor = ({ dayName, daySchedule, onUpdate }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggleDay = () => {
    onUpdate({
      ...daySchedule,
      enabled: !daySchedule.enabled
    });
  };

  const handleAddSlot = () => {
    const newSlot = { start: '09:00', end: '17:00' };
    onUpdate({
      ...daySchedule,
      slots: [...daySchedule.slots, newSlot]
    });
  };

  const handleRemoveSlot = (index) => {
    const newSlots = daySchedule.slots.filter((_, i) => i !== index);
    onUpdate({
      ...daySchedule,
      slots: newSlots
    });
  };

  const handleSlotChange = (index, field, value) => {
    const newSlots = daySchedule.slots.map((slot, i) => {
      if (i === index) {
        return { ...slot, [field]: value };
      }
      return slot;
    });
    onUpdate({
      ...daySchedule,
      slots: newSlots
    });
  };

  const getSlotsPreview = () => {
    if (!daySchedule.enabled) return 'Desactivado';
    if (daySchedule.slots.length === 0) return 'Sin horarios';
    return daySchedule.slots.map(s => `${s.start}-${s.end}`).join(', ');
  };

  return (
    <div className="day-schedule-editor">
      <div className="day-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="day-info">
          <input
            type="checkbox"
            checked={daySchedule.enabled}
            onChange={handleToggleDay}
            onClick={(e) => e.stopPropagation()}
            className="day-checkbox"
          />
          <span className="day-name">{DAYS[dayName]}</span>
          <span className="day-preview">{getSlotsPreview()}</span>
        </div>
        <span className={`expand-icon ${isExpanded ? 'expanded' : ''}`}>▼</span>
      </div>

      {isExpanded && (
        <div className="day-content">
          {daySchedule.enabled ? (
            <>
              <div className="slots-container">
                {daySchedule.slots.map((slot, index) => (
                  <div key={index} className="time-slot">
                    <Clock size={16} className="slot-icon" />
                    <input
                      type="time"
                      value={slot.start}
                      onChange={(e) => handleSlotChange(index, 'start', e.target.value)}
                      className="time-input"
                    />
                    <span className="time-separator">hasta</span>
                    <input
                      type="time"
                      value={slot.end}
                      onChange={(e) => handleSlotChange(index, 'end', e.target.value)}
                      className="time-input"
                    />
                    <button
                      onClick={() => handleRemoveSlot(index)}
                      className="btn-remove-slot"
                      title="Eliminar franja"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
              <button onClick={handleAddSlot} className="btn-add-slot">
                <Plus size={16} />
                Agregar franja horaria
              </button>
            </>
          ) : (
            <p className="disabled-message">
              Activa este día para configurar horarios
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default DayScheduleEditor;
