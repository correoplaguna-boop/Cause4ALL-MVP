# 🖼️ Guía de Imágenes - Cause4All

## 📋 Resumen

Las imágenes en Cause4All son **totalmente editables** mediante URLs. El sistema soporta tres tipos de imágenes:

1. **Imagen de campaña** (`image_url`) - Hero image de la landing page
2. **Imagen del premio** (`prize_image_url`) - Foto del premio del sorteo
3. **Logo de organización** (`logo_url`) - Logo de la AMPA/club/colegio

---

## ✅ Estado Actual (v1.1)

### ✅ Campos Añadidos al Admin
- Campo "🖼️ Imagen de campaña" con preview en tiempo real
- Campo "🎁 Imagen del premio" con preview en tiempo real
- Validación de URLs
- Gestión de errores si la imagen no carga

### ✅ Funcionamiento
- Si pones una URL → muestra la imagen
- Si está vacía → muestra placeholder SVG (montañas bonitas)
- Preview instantáneo mientras editas
- Soporta cualquier URL pública de imagen

---

## 🎯 Cómo Usar las Imágenes

### Opción 1: URLs Externas (Rápido - Recomendado para MVP)

**Servicios recomendados:**

#### Imgur (Gratis, sin registro necesario)
1. Ve a https://imgur.com
2. Click en "New post" o arrastra imagen
3. Una vez subida, click derecho → "Copy image address"
4. Pega en Cause4All: `https://i.imgur.com/ABC123.jpg`

**Pros:** ✅ Instantáneo, sin autenticación, ilimitado
**Contras:** ⚠️ No tienes control total sobre las imágenes

#### Cloudinary (Gratis hasta 25GB)
1. Regístrate en https://cloudinary.com
2. Upload images → Media Library
3. Copia URL de la imagen
4. Pega en Cause4All

**Pros:** ✅ CDN rápido, transformaciones de imagen
**Contras:** ⚠️ Requiere registro

#### Google Drive (Requiere configuración)
1. Sube imagen a Google Drive
2. Click derecho → "Get link" → "Anyone with the link"
3. Modifica URL:
   ```
   Original: https://drive.google.com/file/d/FILE_ID/view
   Modificada: https://drive.google.com/uc?export=view&id=FILE_ID
   ```

**Pros:** ✅ Ya lo usas, familiar
**Contras:** ⚠️ Requiere hacer pública cada imagen

---

### Opción 2: Supabase Storage (Recomendado para Producción)

**Setup inicial (una vez):**

```sql
-- 1. En Supabase Dashboard → SQL Editor, ejecutar:

-- Crear bucket para imágenes de campañas
INSERT INTO storage.buckets (id, name, public)
VALUES ('campaigns', 'campaigns', true);

-- Permitir subida pública (cambiar a auth en producción)
CREATE POLICY "Public Upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'campaigns');

-- Permitir lectura pública
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'campaigns');
```

**Uso:**

1. En Supabase Dashboard → Storage → campaigns bucket
2. Upload files → sube tu imagen
3. Click en la imagen → Copy URL
4. Pega en Cause4All: `https://tu-proyecto.supabase.co/storage/v1/object/public/campaigns/imagen.jpg`

**Pros:** ✅ Control total, mismo servicio que la DB, seguro
**Contras:** ⚠️ Requiere configurar bucket una vez

---

### Opción 3: Upload Directo desde Admin (Futuro)

**Estado:** 🚧 No implementado (puedo agregarlo si quieres)

**Cómo funcionaría:**
- Botón "Subir imagen" en el admin
- Seleccionas archivo de tu ordenador
- Se sube automáticamente a Supabase Storage
- La URL se completa automáticamente

**Esfuerzo de desarrollo:** ~2 horas

---

## 📐 Especificaciones de Imágenes

### Imagen de Campaña (`image_url`)
- **Dimensiones recomendadas:** 1200x600px (ratio 2:1)
- **Peso máximo recomendado:** 500KB
- **Formatos:** JPG, PNG, WebP
- **Uso:** Hero image en la landing page
- **Si está vacía:** Muestra placeholder SVG de montañas

**Ejemplo:**
```
https://imgur.com/abc123.jpg
https://cloudinary.com/demo/campaign_ski.jpg
https://tu-proyecto.supabase.co/storage/v1/object/public/campaigns/esquiada.jpg
```

### Imagen del Premio (`prize_image_url`)
- **Dimensiones recomendadas:** 800x800px (cuadrada)
- **Peso máximo recomendado:** 300KB
- **Formatos:** JPG, PNG, WebP
- **Uso:** Sección del premio en la landing
- **Si está vacía:** No muestra imagen del premio

**Ejemplo:**
```
https://imgur.com/premio.jpg
https://m.media-amazon.com/images/I/61abc.jpg (puedes usar de Amazon)
```

### Logo de Organización (`logo_url`)
- **Estado:** Campo existe en DB pero no está en el admin todavía
- **Dimensiones recomendadas:** 200x200px (cuadrada)
- **Formatos:** PNG con transparencia preferible
- **Uso:** Header de la campaña junto al nombre de la organización

---

## 🎨 Tips de Diseño

### Para Imagen de Campaña
✅ **Buenas prácticas:**
- Usa fotos de alta calidad de actividades similares
- Colores vibrantes que llamen la atención
- Personas sonriendo (conexión emocional)
- Actividad en acción (esquiando, jugando, etc)

❌ **Evitar:**
- Imágenes con mucho texto (dificulta lectura)
- Fondos muy oscuros (baja conversión)
- Fotos borrosas o de baja calidad
- Imágenes de stock obvias

### Para Imagen del Premio
✅ **Buenas prácticas:**
- Fondo blanco o limpio
- Producto centrado
- Vista clara del premio
- Buena iluminación

❌ **Evitar:**
- Fondos desordenados
- Múltiples ángulos (confunde)
- Imágenes genéricas sin el premio específico

---

## 🔧 Solución de Problemas

### ❌ "La imagen no se muestra"
**Causas comunes:**

1. **URL incorrecta**
   - Verifica que empiece con `http://` o `https://`
   - Prueba abrir la URL en nueva pestaña
   - Debe terminar en `.jpg`, `.png`, `.webp`, etc

2. **Imagen privada**
   - En Google Drive: debe estar en modo "Anyone with link"
   - En Supabase: el bucket debe ser público
   - En servicios externos: verifica permisos

3. **CORS bloqueado**
   - Algunos sitios bloquean hotlinking
   - Solución: resubir a Imgur/Cloudinary/Supabase

4. **Imagen eliminada**
   - La URL ya no existe
   - Solución: subir nueva imagen

### 🐛 "Preview no aparece en admin"
El preview tiene `onError` que oculta la imagen si falla. Revisa:
- Consola del navegador (F12) para ver el error
- Intenta abrir la URL directamente
- Verifica que sea una imagen válida

### ⚠️ "Imagen muy lenta en cargar"
- Reduce el tamaño con https://tinypng.com
- Usa formato WebP (más ligero)
- Considera CDN como Cloudinary

---

## 📊 Base de Datos - Campos de Imagen

```sql
-- Tabla: campaigns
image_url TEXT              -- URL de imagen principal
prize_image_url TEXT        -- URL de imagen del premio

-- Tabla: organizations  
logo_url TEXT               -- URL del logo (no implementado en admin aún)
```

### Ver imágenes de tus campañas
```sql
SELECT 
  title,
  image_url,
  prize_image_url,
  CASE 
    WHEN image_url IS NOT NULL THEN '✅' 
    ELSE '❌' 
  END as tiene_imagen
FROM campaigns;
```

---

## 🚀 Roadmap de Imágenes

### v1.1 (Actual) ✅
- [x] Campo de URL de imagen de campaña
- [x] Campo de URL de imagen de premio
- [x] Preview en tiempo real
- [x] Placeholder SVG cuando no hay imagen

### v1.2 (Próximo)
- [ ] Campo de logo de organización en admin
- [ ] Upload directo desde admin a Supabase Storage
- [ ] Crop y resize de imágenes en el admin
- [ ] Galería de imágenes predeterminadas

### v2.0 (Futuro)
- [ ] AI generación de imágenes de campaña
- [ ] Biblioteca de assets compartida
- [ ] Optimización automática de imágenes
- [ ] Editor de imágenes integrado

---

## 💡 Recomendaciones por Tipo de Campaña

### 🎓 Campañas Escolares
**Imagen de campaña sugerida:**
- Foto del colegio/grupo de niños
- Actividad educativa (excursión, laboratorio)
- Uniformes identificables
- Ambiente alegre y colorido

**Servicios de imágenes educativas gratuitas:**
- Unsplash (buscar "school", "education")
- Pexels (buscar "children learning")

### ⚽ Campañas Deportivas
**Imagen de campaña sugerida:**
- Equipo en acción
- Celebración de victoria
- Entrenamiento grupal
- Campo/instalaciones deportivas

**Tips específicos:**
- Añade escudo del club si tienen
- Colores del equipo destacados
- Acción/movimiento captura más atención

### 💚 Campañas Sociales
**Imagen de campaña sugerida:**
- Beneficiarios de la causa
- Actividad solidaria en marcha
- Impacto visual del objetivo
- Personas ayudando/participando

---

## 🆘 ¿Necesitas Ayuda?

**Opciones rápidas:**

1. **Usar placeholder por ahora**
   - Deja `image_url` vacío
   - El SVG de montañas se ve profesional
   - Agrega imagen real más adelante

2. **Banco de imágenes gratuitas**
   - https://unsplash.com (sin atribución necesaria)
   - https://pexels.com (gratis comercial)
   - https://pixabay.com (dominio público)

3. **Contratar diseñador**
   - Fiverr: 5-20€ por imagen personalizada
   - 99designs: Concursos desde 99€

4. **Generar con IA**
   - Midjourney, DALL-E, Stable Diffusion
   - Describe la campaña y genera imagen custom

---

## ✅ Checklist de Imágenes para Producción

Antes de lanzar campaña, verifica:

- [ ] Imagen de campaña subida y funcionando
- [ ] Imagen del premio (si aplica) subida
- [ ] URLs probadas en navegador privado
- [ ] Imágenes optimizadas (<500KB)
- [ ] Preview en mobile se ve bien
- [ ] URLs no van a expirar (evitar enlaces temporales)
- [ ] Imágenes tienen buena calidad
- [ ] No violación de copyright

---

**¿Quieres que implemente el sistema de upload directo?** Puedo agregarlo en ~2h de desarrollo y tendrías:
- Drag & drop de imágenes
- Upload automático a Supabase Storage
- Crop y resize antes de subir
- Sin necesidad de URLs externas

Avísame si te interesa 🚀
