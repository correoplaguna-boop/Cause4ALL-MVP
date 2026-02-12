-- =====================================================
-- SUPABASE STORAGE SETUP - CAUSE4ALL
-- =====================================================
-- Script para configurar almacenamiento de imágenes
-- Ejecutar en Supabase SQL Editor una sola vez
-- =====================================================

-- 1. Crear bucket para imágenes de campañas
INSERT INTO storage.buckets (id, name, public)
VALUES ('campaigns', 'campaigns', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Crear bucket para logos de organizaciones
INSERT INTO storage.buckets (id, name, public)
VALUES ('organizations', 'organizations', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Crear bucket para imágenes de premios
INSERT INTO storage.buckets (id, name, public)
VALUES ('prizes', 'prizes', true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- POLÍTICAS DE ACCESO
-- =====================================================

-- CAMPAIGNS BUCKET
-- Permitir subida pública (cambiar a auth.uid() en producción si quieres restringir)
CREATE POLICY "Allow public upload to campaigns"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'campaigns');

-- Permitir lectura pública de imágenes
CREATE POLICY "Allow public read from campaigns"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'campaigns');

-- Permitir actualización (por si quieren reemplazar imágenes)
CREATE POLICY "Allow public update in campaigns"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'campaigns');

-- Permitir borrado
CREATE POLICY "Allow public delete from campaigns"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'campaigns');

-- ORGANIZATIONS BUCKET
CREATE POLICY "Allow public upload to organizations"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'organizations');

CREATE POLICY "Allow public read from organizations"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'organizations');

CREATE POLICY "Allow public update in organizations"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'organizations');

CREATE POLICY "Allow public delete from organizations"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'organizations');

-- PRIZES BUCKET
CREATE POLICY "Allow public upload to prizes"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'prizes');

CREATE POLICY "Allow public read from prizes"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'prizes');

CREATE POLICY "Allow public update in prizes"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'prizes');

CREATE POLICY "Allow public delete from prizes"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'prizes');

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

-- Ver buckets creados
SELECT 
  id,
  name,
  public,
  created_at
FROM storage.buckets
WHERE id IN ('campaigns', 'organizations', 'prizes');

-- Ver políticas creadas
SELECT 
  policyname,
  bucket_id,
  permissive
FROM storage.policies
WHERE bucket_id IN ('campaigns', 'organizations', 'prizes');

-- =====================================================
-- NOTAS IMPORTANTES
-- =====================================================

/*
✅ CONFIGURACIÓN COMPLETADA

Los tres buckets están listos para usar:
- campaigns: Para imágenes principales de campañas
- organizations: Para logos de organizaciones
- prizes: Para imágenes de premios

📍 URLs de tus imágenes tendrán este formato:
https://TU_PROYECTO.supabase.co/storage/v1/object/public/campaigns/nombre-imagen.jpg

🔐 SEGURIDAD PARA PRODUCCIÓN:
Por ahora las políticas permiten subida pública para facilitar el MVP.
Para producción, considera cambiar las políticas INSERT a:

WITH CHECK (bucket_id = 'campaigns' AND auth.uid() IS NOT NULL)

Esto requiere que los usuarios estén autenticados para subir.

📦 LÍMITES:
- Supabase Free: 1GB storage
- Supabase Pro: 100GB storage
- Tamaño máximo archivo: 50MB

💡 PRÓXIMO PASO:
Ahora puedes subir imágenes desde:
1. Supabase Dashboard → Storage → campaigns/organizations/prizes
2. Código (futuro upload directo desde admin)

🔧 TEST:
1. Ve a Supabase Dashboard → Storage
2. Selecciona bucket "campaigns"
3. Click "Upload file"
4. Sube una imagen de prueba
5. Click en la imagen → Copy URL
6. Pega esa URL en el admin de Cause4All
*/
