-- Opción 1: Hacer password nullable (permite NULL)
ALTER TABLE "Usuario" ALTER COLUMN "password" DROP NOT NULL;

-- Opción 2 (MEJOR): Eliminar la columna password completamente
-- ALTER TABLE "Usuario" DROP COLUMN "password";
