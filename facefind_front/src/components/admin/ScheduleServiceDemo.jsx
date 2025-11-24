import React, { useEffect } from 'react';
import {
  getSchedules,
  createSchedule,
  isWithinSchedule,
  logOffHoursAlert,
  getOffHoursLogs,
  getLogsStatistics
} from '../services/scheduleService';

/**
 * Componente de demostración para probar el servicio de horarios
 * Ejecuta escenarios de prueba automáticos
 */
const ScheduleServiceDemo = () => {
  useEffect(() => {
    runDemo();
  }, []);

  const runDemo = () => {
    console.group('🔍 DEMO: Servicio de Horarios de Alertas');

    // 1. Obtener horarios existentes
    console.log('\n📋 1. Horarios existentes:');
    const schedules = getSchedules();
    console.log(schedules);

    // 2. Crear un horario de oficina (9-17 de L-V)
    console.log('\n➕ 2. Creando horario de oficina...');
    const officeSchedule = {
      name: 'Horario Oficina',
      cameraId: 'cam1',
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
    const result = createSchedule(officeSchedule);
    console.log('Resultado:', result);

    // 3. Probar validación de horarios
    console.log('\n✅ 3. Validando horarios...');
    
    // Caso 1: Lunes a las 10:00 (dentro del horario)
    const monday10 = new Date('2025-11-24T10:00:00'); // Lunes
    const isValid1 = isWithinSchedule(result.schedule.id, monday10, false);
    console.log(`Lunes 10:00 - Dentro del horario: ${isValid1}`);

    // Caso 2: Lunes a las 20:00 (fuera del horario)
    const monday20 = new Date('2025-11-24T20:00:00'); // Lunes
    const isValid2 = isWithinSchedule(result.schedule.id, monday20, false);
    console.log(`Lunes 20:00 - Dentro del horario: ${isValid2}`);

    // Caso 3: Sábado (día desactivado)
    const saturday = new Date('2025-11-29T10:00:00'); // Sábado
    const isValid3 = isWithinSchedule(result.schedule.id, saturday, false);
    console.log(`Sábado 10:00 - Dentro del horario: ${isValid3}`);

    // Caso 4: Alerta crítica fuera de horario (debe pasar)
    const isValid4 = isWithinSchedule(result.schedule.id, monday20, true);
    console.log(`Lunes 20:00 CRÍTICO - Permitido por override: ${isValid4}`);

    // 4. Registrar logs de prueba
    console.log('\n📝 4. Registrando logs de alertas fuera de horario...');
    
    logOffHoursAlert({
      cameraId: 'cam1',
      cameraName: 'Cámara Entrada',
      isCritical: false,
      reason: 'Fuera del horario de oficina',
      alertMessage: 'Persona desconocida detectada'
    });

    logOffHoursAlert({
      cameraId: 'cam2',
      cameraName: 'Cámara Estacionamiento',
      isCritical: true,
      reason: 'Alerta crítica - movimiento sospechoso',
      alertMessage: 'Actividad inusual detectada'
    });

    logOffHoursAlert({
      cameraId: 'cam1',
      cameraName: 'Cámara Entrada',
      isCritical: false,
      reason: 'Fin de semana',
      alertMessage: 'Acceso detectado en día no laboral'
    });

    console.log('✅ 3 logs registrados');

    // 5. Obtener logs con filtros
    console.log('\n📊 5. Consultando logs...');
    
    const allLogs = getOffHoursLogs();
    console.log(`Total de logs: ${allLogs.length}`);
    
    const criticalLogs = getOffHoursLogs({ isCritical: true });
    console.log(`Logs críticos: ${criticalLogs.length}`);

    const cam1Logs = getOffHoursLogs({ cameraId: 'cam1' });
    console.log(`Logs de cam1: ${cam1Logs.length}`);

    // 6. Obtener estadísticas
    console.log('\n📈 6. Estadísticas de logs:');
    const stats = getLogsStatistics();
    console.log(stats);

    console.groupEnd();

    // Mostrar mensaje en consola
    console.log('\n' + '='.repeat(60));
    console.log('✅ DEMO COMPLETADO');
    console.log('Abre la consola del navegador para ver los resultados');
    console.log('Navega a /admin/horarios-alertas para ver la interfaz');
    console.log('='.repeat(60));
  };

  return (
    <div style={{
      padding: '2rem',
      maxWidth: '800px',
      margin: '2rem auto',
      background: 'white',
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    }}>
      <h1>🔍 Demo: Servicio de Horarios</h1>
      <p>Se han ejecutado pruebas automáticas del servicio de horarios.</p>
      <div style={{
        background: '#f7fafc',
        padding: '1rem',
        borderRadius: '6px',
        marginTop: '1rem',
        fontFamily: 'monospace'
      }}>
        <p>✅ Horarios creados</p>
        <p>✅ Validaciones ejecutadas</p>
        <p>✅ Logs registrados</p>
        <p>✅ Estadísticas generadas</p>
      </div>
      <div style={{
        marginTop: '1.5rem',
        padding: '1rem',
        background: '#edf2f7',
        borderRadius: '6px',
        borderLeft: '4px solid #667eea'
      }}>
        <strong>📝 Instrucciones:</strong>
        <ol style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
          <li>Abre la consola del navegador (F12)</li>
          <li>Revisa los resultados de las pruebas</li>
          <li>Navega a <code>/admin/horarios-alertas</code></li>
          <li>Explora la interfaz completa</li>
        </ol>
      </div>
      <button
        onClick={runDemo}
        style={{
          marginTop: '1.5rem',
          padding: '0.75rem 1.5rem',
          background: '#667eea',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: '600',
          fontSize: '1rem'
        }}
      >
        🔄 Ejecutar Demo Nuevamente
      </button>
    </div>
  );
};

export default ScheduleServiceDemo;
