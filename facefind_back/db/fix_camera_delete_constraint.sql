-- Fix: Permitir eliminar cámaras incluso si tienen alertas asociadas
-- Esto cambia la constraint de ON DELETE RESTRICT a ON DELETE SET NULL
-- Cuando se elimina una cámara, las alertas asociadas tendrán camara_id = NULL

-- Paso 1: Primero, hacer que camara_id sea NULLABLE en Alerta (si no lo es)
ALTER TABLE "Alerta" 
ALTER COLUMN "camara_id" DROP NOT NULL;

-- Paso 2: Eliminar la constraint antigua
ALTER TABLE "Alerta" 
DROP CONSTRAINT IF EXISTS "Alerta_camara_id_fkey";

-- Paso 3: Crear nueva constraint con ON DELETE SET NULL
ALTER TABLE "Alerta" 
ADD CONSTRAINT "Alerta_camara_id_fkey" 
FOREIGN KEY ("camara_id") 
REFERENCES "Camara" ("id") 
ON DELETE SET NULL;

-- Verificar los cambios
SELECT 
    conname AS constraint_name,
    conrelid::regclass AS table_name,
    confrelid::regclass AS foreign_table,
    confdeltype AS on_delete_action
FROM pg_constraint
WHERE conname = 'Alerta_camara_id_fkey';

-- Leyenda de on_delete_action:
-- a = NO ACTION
-- r = RESTRICT  
-- c = CASCADE
-- n = SET NULL (lo que queremos)
-- d = SET DEFAULT
