# 🛠️ Instrucciones de Configuración en Supabase

## Paso 1 — Ejecutar el SQL en el Editor de Supabase

Ve a tu proyecto en Supabase → SQL Editor → New Query, y ejecuta:

```sql
-- =============================================
-- 1. PAQUETES DE PRECIOS
-- =============================================
INSERT INTO packages (name, subtitle, price, features, is_highlighted)
VALUES
  ('Básico', 'Ideal para comenzar', 10,
   '["Acceso a cursos básicos", "Material en PDF", "Soporte por email", "Actualizaciones mensuales", "Comunidad de aprendizaje"]',
   false),
  ('Profesional', 'El más popular', 20,
   '["Todo lo del plan Básico", "Cursos en video HD", "Soporte prioritario 48h", "Acceso a webinars en vivo", "Certificados de curso", "Ejercicios prácticos"]',
   true),
  ('Completo', 'Para profesionales', 30,
   '["Todo lo del plan Profesional", "Cursos avanzados exclusivos", "Sesiones 1 a 1 con instructor", "Acceso vitalicio al contenido", "Recursos y herramientas extra", "Soporte 24/7"]',
   false)
ON CONFLICT DO NOTHING;

-- =============================================
-- 2. CURSOS DE MUESTRA
-- =============================================
INSERT INTO courses (title, description, package_requirement, type, image_color, is_active)
VALUES
  ('Fundamentos de Motores Eléctricos', 'Introducción a los principios básicos de los motores eléctricos y sus componentes principales.', 'Básico', 'book', 'bg-blue-600', true),
  ('Motores de Corriente Continua (DC)', 'Análisis completo de motores DC: tipos, características y aplicaciones industriales.', 'Básico', 'video', 'bg-indigo-600', true),
  ('Mantenimiento Preventivo', 'Guía práctica de mantenimiento preventivo para prolongar la vida útil de los motores.', 'Básico', 'book', 'bg-green-600', true),
  ('Motores de Inducción Trifásicos', 'Estudio detallado de motores de inducción trifásicos y su comportamiento eléctrico.', 'Profesional', 'book', 'bg-purple-600', true),
  ('Control de Velocidad con VFD', 'Programación y uso de variadores de frecuencia (VFD) para control de velocidad.', 'Profesional', 'video', 'bg-orange-600', true),
  ('Protección de Motores Eléctricos', 'Sistemas de protección: relés térmicos, guardamotores y arrancadores suaves.', 'Profesional', 'book', 'bg-blue-700', true),
  ('Diagnóstico de Fallas Avanzado', 'Identificación y resolución de fallas complejas mediante análisis vibración y termografía.', 'Completo', 'video', 'bg-red-600', true),
  ('Motores Síncronos de Imán Permanente', 'Tecnología PMSM: fundamentos, control vectorial y aplicaciones en vehículos eléctricos.', 'Completo', 'book', 'bg-teal-600', true),
  ('Automatización con PLC y Motores', 'Integración de motores eléctricos en sistemas automatizados con PLCs Siemens y Allen Bradley.', 'Completo', 'video', 'bg-indigo-700', true),
  ('Eficiencia Energética IE4 y IE5', 'Optimización del consumo energético y normativas de eficiencia en motores industriales.', 'Completo', 'book', 'bg-green-700', true)
ON CONFLICT DO NOTHING;

-- =============================================
-- 3. ACTIVAR USUARIO ADMINISTRADOR
-- (Ejecuta DESPUÉS de crear el usuario admin@autoacademy.com)
-- =============================================
UPDATE profiles 
SET is_admin = true 
WHERE email = 'admin@autoacademy.com';

-- =============================================
-- 4. POLÍTICA RLS PARA CONTACTO (si no existe)
-- =============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'contact_messages' 
    AND policyname = 'Anyone can insert contact messages'
  ) THEN
    CREATE POLICY "Anyone can insert contact messages" ON contact_messages
    FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- Asegurarse que RLS está habilitado
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;

-- Política lectura pública para paquetes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'packages' 
    AND policyname = 'Anyone can read packages'
  ) THEN
    CREATE POLICY "Anyone can read packages" ON packages
    FOR SELECT USING (true);
  END IF;
END $$;

-- Política lectura pública para cursos activos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'courses' 
    AND policyname = 'Anyone can read active courses'
  ) THEN
    CREATE POLICY "Anyone can read active courses" ON courses
    FOR SELECT USING (is_active = true);
  END IF;
END $$;
```

## Paso 2 — Crear el usuario Admin en Supabase Auth

1. Ve a **Authentication → Users → Add User**
2. Email: `admin@autoacademy.com`
3. Contraseña: la que desees
4. Marca **"Auto Confirm User"** ✅
5. Luego ejecuta el UPDATE del paso 3 del SQL

## Paso 3 — Configurar Email en Supabase Auth

Para que el correo de verificación llegue correctamente:

1. Ve a **Authentication → Email Templates**
2. Verifica que el template "Confirm signup" esté activado
3. En **Authentication → URL Configuration**:
   - **Site URL**: la URL de tu app en producción
   - **Redirect URLs**: agrega la URL de tu app

## Notas importantes

- Los paquetes usan `features` como JSONB array de strings
- La tabla `subscriptions` necesita las columnas: `id`, `user_id`, `package_id`, `status`, `created_at`, `updated_at`
- La tabla `profiles` necesita la columna `is_admin` (boolean, default false)
