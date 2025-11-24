/**
 * EJEMPLOS DE USO: scheduleService.js
 * 
 * Este archivo contiene ejemplos prácticos de cómo usar
 * el servicio de horarios de alertas en tu aplicación.
 */

import {
  getSchedules,
  createSchedule,
  updateSchedule,
  isWithinSchedule,
  addException,
  logOffHoursAlert,
  getOffHoursLogs
} from '../services/scheduleService';

// ========================================
// EJEMPLO 1: Crear un horario de oficina
// ========================================

const crearHorarioOficina = () => {
  const horarioOficina = {
    name: 'Horario Oficina Central',
    cameraId: null, // null = aplica a todas las cámaras
    days: {
      monday: {
        enabled: true,
        slots: [
          { start: '08:00', end: '12:00' },
          { start: '14:00', end: '18:00' }
        ]
      },
      tuesday: {
        enabled: true,
        slots: [
          { start: '08:00', end: '12:00' },
          { start: '14:00', end: '18:00' }
        ]
      },
      wednesday: {
        enabled: true,
        slots: [
          { start: '08:00', end: '12:00' },
          { start: '14:00', end: '18:00' }
        ]
      },
      thursday: {
        enabled: true,
        slots: [
          { start: '08:00', end: '12:00' },
          { start: '14:00', end: '18:00' }
        ]
      },
      friday: {
        enabled: true,
        slots: [
          { start: '08:00', end: '12:00' },
          { start: '14:00', end: '18:00' }
        ]
      },
      saturday: { enabled: false, slots: [] },
      sunday: { enabled: false, slots: [] }
    },
    exceptions: [],
    criticalOverride: true // Permitir alertas críticas siempre
  };

  const result = createSchedule(horarioOficina);
  
  if (result.success) {
    console.log('✅ Horario creado:', result.schedule.id);
    return result.schedule.id;
  } else {
    console.error('❌ Error:', result.error);
    return null;
  }
};

// ========================================
// EJEMPLO 2: Crear horario 24/7 para cámara específica
// ========================================

const crearHorario24x7 = (cameraId) => {
  const horario24x7 = {
    name: 'Vigilancia 24/7',
    cameraId: cameraId, // Asignar a cámara específica
    days: {
      monday: { enabled: true, slots: [{ start: '00:00', end: '23:59' }] },
      tuesday: { enabled: true, slots: [{ start: '00:00', end: '23:59' }] },
      wednesday: { enabled: true, slots: [{ start: '00:00', end: '23:59' }] },
      thursday: { enabled: true, slots: [{ start: '00:00', end: '23:59' }] },
      friday: { enabled: true, slots: [{ start: '00:00', end: '23:59' }] },
      saturday: { enabled: true, slots: [{ start: '00:00', end: '23:59' }] },
      sunday: { enabled: true, slots: [{ start: '00:00', end: '23:59' }] }
    },
    exceptions: [],
    criticalOverride: true
  };

  return createSchedule(horario24x7);
};

// ========================================
// EJEMPLO 3: Agregar excepción para día festivo
// ========================================

const agregarDiaFestivo = (scheduleId, fecha, motivo) => {
  const excepcion = {
    date: fecha, // Formato: "YYYY-MM-DD"
    enabled: false, // Desactivar alertas en este día
    reason: motivo
  };

  const result = addException(scheduleId, excepcion);
  
  if (result.success) {
    console.log(`✅ Excepción agregada para ${fecha}`);
  } else {
    console.error('❌ Error al agregar excepción:', result.error);
  }
  
  return result;
};

// ========================================
// EJEMPLO 4: Verificar si una alerta debe enviarse
// ========================================

const debeEnviarAlerta = (scheduleId, esCritica = false) => {
  const ahora = new Date();
  const permitida = isWithinSchedule(scheduleId, ahora, esCritica);
  
  if (permitida) {
    console.log('✅ Alerta permitida - dentro del horario');
    return true;
  } else {
    console.log('⏰ Alerta bloqueada - fuera del horario');
    // Registrar en logs
    logOffHoursAlert({
      cameraId: 'cam1',
      cameraName: 'Cámara Principal',
      isCritical: esCritica,
      reason: 'Fuera del horario configurado',
      alertMessage: 'Detección bloqueada por horario'
    });
    return false;
  }
};

// ========================================
// EJEMPLO 5: Integración con sistema de alertas
// ========================================

const procesarAlerta = async (alertData) => {
  // alertData = { cameraId, message, isCritical }
  
  // 1. Obtener horario de la cámara
  const schedules = getSchedules();
  const schedule = schedules.find(s => 
    s.cameraId === alertData.cameraId || s.cameraId === null
  );
  
  if (!schedule) {
    console.warn('⚠️ No hay horario configurado, enviando alerta...');
    return enviarAlerta(alertData);
  }
  
  // 2. Verificar si está dentro del horario
  const ahora = new Date();
  const permitida = isWithinSchedule(
    schedule.id, 
    ahora, 
    alertData.isCritical
  );
  
  // 3. Decidir acción
  if (permitida) {
    console.log('✅ Enviando alerta...');
    return enviarAlerta(alertData);
  } else {
    console.log('⏰ Alerta fuera de horario, registrando en logs...');
    logOffHoursAlert({
      cameraId: alertData.cameraId,
      cameraName: alertData.cameraName,
      isCritical: alertData.isCritical,
      reason: 'Fuera del horario operativo',
      alertMessage: alertData.message
    });
    return { success: false, reason: 'off-hours' };
  }
};

// Función simulada de envío de alerta
const enviarAlerta = async (alertData) => {
  // Aquí iría la lógica real de envío
  console.log('📧 Enviando alerta:', alertData.message);
  return { success: true };
};

// ========================================
// EJEMPLO 6: Actualizar horario existente
// ========================================

const actualizarHorarioFinDeSemana = (scheduleId) => {
  const schedules = getSchedules();
  const schedule = schedules.find(s => s.id === scheduleId);
  
  if (!schedule) {
    console.error('❌ Horario no encontrado');
    return;
  }
  
  // Habilitar sábados con horario reducido
  const updatedSchedule = {
    ...schedule,
    days: {
      ...schedule.days,
      saturday: {
        enabled: true,
        slots: [{ start: '09:00', end: '13:00' }]
      }
    }
  };
  
  const result = updateSchedule(scheduleId, updatedSchedule);
  
  if (result.success) {
    console.log('✅ Horario actualizado');
  }
  
  return result;
};

// ========================================
// EJEMPLO 7: Consultar logs con filtros
// ========================================

const consultarLogsRecientes = () => {
  const hace7Dias = new Date();
  hace7Dias.setDate(hace7Dias.getDate() - 7);
  
  // Obtener logs de los últimos 7 días
  const logs = getOffHoursLogs({
    startDate: hace7Dias.toISOString().split('T')[0]
  });
  
  console.log(`📊 Logs últimos 7 días: ${logs.length}`);
  
  // Filtrar solo críticos
  const criticos = logs.filter(log => log.isCritical);
  console.log(`🚨 Alertas críticas bloqueadas: ${criticos.length}`);
  
  // Agrupar por cámara
  const porCamara = logs.reduce((acc, log) => {
    acc[log.cameraId] = (acc[log.cameraId] || 0) + 1;
    return acc;
  }, {});
  
  console.log('📹 Distribución por cámara:', porCamara);
  
  return { total: logs.length, criticos: criticos.length, porCamara };
};

// ========================================
// EJEMPLO 8: Horario con múltiples turnos
// ========================================

const crearHorarioTurnos = () => {
  const horarioTurnos = {
    name: 'Horario Turnos Rotativos',
    cameraId: 'cam_produccion',
    days: {
      monday: {
        enabled: true,
        slots: [
          { start: '06:00', end: '14:00' }, // Turno mañana
          { start: '14:00', end: '22:00' }, // Turno tarde
          { start: '22:00', end: '06:00' }  // Turno noche
        ]
      },
      // ... repetir para otros días
    },
    exceptions: [],
    criticalOverride: true
  };
  
  return createSchedule(horarioTurnos);
};

// ========================================
// EJEMPLO 9: Verificar múltiples horarios
// ========================================

const verificarSistemasActivos = () => {
  const schedules = getSchedules();
  const ahora = new Date();
  
  const activos = schedules.filter(schedule => {
    return isWithinSchedule(schedule.id, ahora, false);
  });
  
  console.log(`🟢 Sistemas activos: ${activos.length}/${schedules.length}`);
  
  activos.forEach(schedule => {
    console.log(`  - ${schedule.name} (${schedule.cameraId || 'Global'})`);
  });
  
  return activos;
};

// ========================================
// EJEMPLO 10: Horarios pre-configurados
// ========================================

const HORARIOS_PREDEFINIDOS = {
  oficina: {
    name: 'Horario Oficina Estándar',
    days: {
      monday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
      tuesday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
      wednesday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
      thursday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
      friday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
      saturday: { enabled: false, slots: [] },
      sunday: { enabled: false, slots: [] }
    }
  },
  comercio: {
    name: 'Horario Comercio',
    days: {
      monday: { enabled: true, slots: [{ start: '10:00', end: '20:00' }] },
      tuesday: { enabled: true, slots: [{ start: '10:00', end: '20:00' }] },
      wednesday: { enabled: true, slots: [{ start: '10:00', end: '20:00' }] },
      thursday: { enabled: true, slots: [{ start: '10:00', end: '20:00' }] },
      friday: { enabled: true, slots: [{ start: '10:00', end: '20:00' }] },
      saturday: { enabled: true, slots: [{ start: '10:00', end: '18:00' }] },
      sunday: { enabled: false, slots: [] }
    }
  },
  vigilancia: {
    name: 'Vigilancia 24/7',
    days: {
      monday: { enabled: true, slots: [{ start: '00:00', end: '23:59' }] },
      tuesday: { enabled: true, slots: [{ start: '00:00', end: '23:59' }] },
      wednesday: { enabled: true, slots: [{ start: '00:00', end: '23:59' }] },
      thursday: { enabled: true, slots: [{ start: '00:00', end: '23:59' }] },
      friday: { enabled: true, slots: [{ start: '00:00', end: '23:59' }] },
      saturday: { enabled: true, slots: [{ start: '00:00', end: '23:59' }] },
      sunday: { enabled: true, slots: [{ start: '00:00', end: '23:59' }] }
    }
  }
};

const aplicarHorarioPredefinido = (tipo, cameraId = null) => {
  const template = HORARIOS_PREDEFINIDOS[tipo];
  
  if (!template) {
    console.error('❌ Tipo de horario no válido');
    return;
  }
  
  const horario = {
    ...template,
    cameraId,
    exceptions: [],
    criticalOverride: true
  };
  
  return createSchedule(horario);
};

// ========================================
// EXPORTAR EJEMPLOS
// ========================================

export {
  crearHorarioOficina,
  crearHorario24x7,
  agregarDiaFestivo,
  debeEnviarAlerta,
  procesarAlerta,
  actualizarHorarioFinDeSemana,
  consultarLogsRecientes,
  crearHorarioTurnos,
  verificarSistemasActivos,
  aplicarHorarioPredefinido,
  HORARIOS_PREDEFINIDOS
};

// ========================================
// EJEMPLO DE USO COMPLETO
// ========================================

/*
// 1. Crear horario de oficina
const scheduleId = crearHorarioOficina();

// 2. Agregar excepción para Navidad
agregarDiaFestivo(scheduleId, '2025-12-25', 'Navidad');

// 3. Procesar una alerta
const alertData = {
  cameraId: 'cam1',
  cameraName: 'Cámara Entrada',
  message: 'Persona detectada',
  isCritical: false
};
procesarAlerta(alertData);

// 4. Consultar logs
const stats = consultarLogsRecientes();

// 5. Verificar sistemas activos
verificarSistemasActivos();
*/
