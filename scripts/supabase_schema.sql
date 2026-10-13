-- ==============================================================================
-- TABLA DE USUARIOS PARA EL PORTAL DE OBRAS (SUPABASE / POSTGRESQL)
-- ==============================================================================
-- Copiá y ejecutá este script en el editor SQL de tu panel de Supabase:
-- https://supabase.com/dashboard/project/_/sql

-- 1. Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'OPERADOR' CHECK (role IN ('ADMIN', 'OPERADOR')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  department TEXT DEFAULT 'Infraestructura',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  last_login TIMESTAMPTZ
);

-- 2. Índices de aceleración de consultas
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users (lower(email));
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users (role);
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users (status);

-- 3. Habilitar Row Level Security (RLS) para máxima protección
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 4. Política de aislamiento:
-- Solo el backend del Portal de Obras (con SUPABASE_SERVICE_ROLE_KEY) tiene acceso completo.
-- Las peticiones públicas o anónimas tienen denegado el acceso directo.
DROP POLICY IF EXISTS "Acceso administrativo backend" ON public.users;
CREATE POLICY "Acceso administrativo backend" ON public.users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ==============================================================================
-- 5. USUARIO ADMINISTRADOR INICIAL (OPCIONAL)
-- ==============================================================================
-- Si querés insertar directamente el usuario administrador antes de iniciar la app:
-- Contraseña de este ejemplo: Admin1234! (hasheada con bcrypt)
-- Si definís ADMIN_EMAIL y ADMIN_PASSWORD en Vercel, la app lo crea automáticamente.

INSERT INTO public.users (id, name, email, password_hash, role, status, department)
VALUES (
  'usr-admin-01',
  'Administrador General',
  'admin@portaldeobras.gob.ar',
  '$2b$10$iLPutEjROT0ubuGttLIvvevB1SlY4lcJ6DJ5zBSwAlATbiftbbgKe',
  'ADMIN',
  'active',
  'Dirección General de Obras Públicas'
)
ON CONFLICT (email) DO NOTHING;
