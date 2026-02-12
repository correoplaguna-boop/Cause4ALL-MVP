# 🚀 Guía de Implementación Paso a Paso - Cause4All

## 📋 Índice
1. [Requisitos Previos](#requisitos-previos)
2. [Parte 1: Configurar Supabase (Base de Datos)](#parte-1-configurar-supabase)
3. [Parte 2: Configurar Stripe (Pagos)](#parte-2-configurar-stripe)
4. [Parte 3: Desplegar en Vercel (Hosting)](#parte-3-desplegar-en-vercel)
5. [Parte 4: Primera Campaña](#parte-4-crear-tu-primera-campaña)
6. [Parte 5: Testing Completo](#parte-5-testing-completo)
7. [Solución de Problemas](#solución-de-problemas)

---

## Requisitos Previos

### Lo que necesitas tener:
- ✅ Ordenador con navegador web
- ✅ Correo electrónico
- ✅ 30-45 minutos de tiempo
- ✅ El archivo `cause4all-mvp-updated.zip` descargado

### Lo que NO necesitas saber:
- ❌ Programación
- ❌ Línea de comandos / Terminal
- ❌ Configuración de servidores

### Servicios que usaremos (todos GRATIS para empezar):
1. **Supabase** - Base de datos (gratis hasta 500MB)
2. **Stripe** - Pagos (sin costos fijos, solo comisiones por transacción)
3. **Vercel** - Hosting de la web (gratis para proyectos personales)
4. **GitHub** - Almacenamiento del código (gratis)

---

## Parte 1: Configurar Supabase

### Paso 1.1: Crear Cuenta en Supabase

1. Ve a **https://supabase.com**
2. Click en **"Start your project"**
3. Elige **"Sign in with GitHub"** (o email si prefieres)
4. Si no tienes GitHub:
   - Ve a **https://github.com/signup**
   - Crea cuenta (gratis)
   - Vuelve a Supabase y haz login

### Paso 1.2: Crear Proyecto

1. Una vez dentro, click **"New Project"**
2. Completa el formulario:
   ```
   Name: cause4all-production
   Database Password: [Genera una contraseña fuerte]
   Region: Europe West (London) ← Si estás en España
   Pricing Plan: Free
   ```
3. **⚠️ IMPORTANTE**: Guarda la contraseña en un lugar seguro
4. Click **"Create new project"**
5. **Espera 2-3 minutos** mientras se crea el proyecto

### Paso 1.3: Copiar Credenciales

Una vez creado el proyecto:

1. En el menú lateral → Click en **"Project Settings"** (⚙️ icono)
2. Click en **"API"**
3. Verás esta información:

```
Project URL: https://xxxxxxxxxxx.supabase.co
anon public: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

4. **Copia y pega en un documento de texto**:
   - Project URL
   - anon public (la key que dice "anon" / "public")

### Paso 1.4: Crear las Tablas

1. En el menú lateral → Click en **"SQL Editor"**
2. Click en **"+ New query"**
3. **Descarga el archivo** `supabase/schema.sql` del ZIP
4. **Abre el archivo** con Bloc de Notas / TextEdit
5. **Copia TODO el contenido** (Ctrl+A, Ctrl+C)
6. **Pega en el editor SQL** de Supabase
7. Click en **"Run"** (botón verde abajo a la derecha)
8. Deberías ver: ✅ "Success. No rows returned"

### Paso 1.5: Verificar Tablas

1. En el menú lateral → Click en **"Table Editor"**
2. Deberías ver 3 tablas:
   - ✅ organizations
   - ✅ campaigns
   - ✅ donations

**Si ves las 3 tablas, ¡perfecto! Supabase está listo. ✅**

### Paso 1.6: Configurar Storage (Opcional - para imágenes)

1. En el menú lateral → Click en **"SQL Editor"**
2. Click en **"+ New query"**
3. **Descarga el archivo** `supabase/storage-setup.sql` del ZIP
4. **Copia TODO el contenido** y pega en el editor
5. Click en **"Run"**
6. En el menú lateral → Click en **"Storage"**
7. Deberías ver 3 buckets:
   - ✅ campaigns
   - ✅ organizations
   - ✅ prizes

---

## Parte 2: Configurar Stripe

### Paso 2.1: Crear Cuenta en Stripe

1. Ve a **https://stripe.com/es**
2. Click en **"Empezar ahora"** / **"Sign up"**
3. Completa el registro:
   - Email
   - Contraseña
   - País: Spain
4. Verifica tu email

### Paso 2.2: Activar Modo Test

⚠️ **IMPORTANTE**: Vamos a usar el "Modo Test" para no cobrar dinero real

1. Una vez dentro del Dashboard
2. Arriba a la derecha verás un interruptor **"Modo de prueba"**
3. Asegúrate que esté **ACTIVADO** (debe decir "Modo de prueba")

### Paso 2.3: Obtener API Keys

1. En el menú lateral → Click en **"Developers"** (Desarrolladores)
2. Click en **"API keys"** (Claves de API)
3. Verás dos claves en modo test:

```
Publishable key: pk_test_51xxxxx
Secret key: sk_test_51xxxxx (click "Reveal test key")
```

4. **Copia y pega en tu documento de texto**:
   - Publishable key (pk_test_...)
   - Secret key (sk_test_...)

### Paso 2.4: Crear Webhook

1. En el menú lateral → **"Developers"** → **"Webhooks"**
2. Click en **"Add endpoint"** / **"Añadir endpoint"**
3. **DETENTE AQUÍ** - Volveremos después de desplegar en Vercel
   - Necesitamos la URL de tu web primero
4. **Marca esta página en favoritos** - volveremos aquí

---

## Parte 3: Desplegar en Vercel

### Paso 3.1: Crear Cuenta en GitHub

Si ya tienes cuenta, salta al Paso 3.2

1. Ve a **https://github.com/signup**
2. Completa el registro
3. Verifica tu email

### Paso 3.2: Subir Código a GitHub

**Opción A: Usando GitHub Web (MÁS FÁCIL)**

1. Ve a **https://github.com/new**
2. Pon nombre: `cause4all-mvp`
3. Deja en **Public**
4. Click **"Create repository"**
5. Click en **"uploading an existing file"**
6. **Descomprime** `cause4all-mvp-updated.zip` en tu ordenador
7. **Arrastra TODOS los archivos** de la carpeta descomprimida
8. Scroll abajo → Click **"Commit changes"**
9. **Espera** a que se suban todos (puede tardar 1-2 min)

**Opción B: Usando GitHub Desktop (si eres técnico)**

[Instrucciones para usuarios avanzados - omitir si usas Opción A]

### Paso 3.3: Conectar con Vercel

1. Ve a **https://vercel.com/signup**
2. Click en **"Continue with GitHub"**
3. Autoriza a Vercel
4. Una vez dentro, click **"Add New..."** → **"Project"**
5. Busca tu repositorio **"cause4all-mvp"**
6. Click en **"Import"**

### Paso 3.4: Configurar Variables de Entorno

Ahora viene la parte importante:

1. En la sección **"Environment Variables"**, añade una a una:

```env
Name: NEXT_PUBLIC_SUPABASE_URL
Value: [Pega aquí tu Project URL de Supabase]

Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: [Pega aquí tu anon public key de Supabase]

Name: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
Value: [Pega aquí tu pk_test_... de Stripe]

Name: STRIPE_SECRET_KEY
Value: [Pega aquí tu sk_test_... de Stripe]

Name: STRIPE_WEBHOOK_SECRET
Value: whsec_temporal_dejalo_vacio_por_ahora
```

2. **Para cada variable**:
   - Escribe el "Name"
   - Pega el "Value"
   - Click **"Add"**
   - Repite para las 5 variables

### Paso 3.5: Desplegar

1. Click en **"Deploy"**
2. **Espera 2-3 minutos** mientras se despliega
3. Verás confeti 🎉 cuando termine
4. Click en la imagen del proyecto
5. Verás tu URL: **`https://cause4all-mvp-xxxxx.vercel.app`**
6. **Copia esta URL** - la necesitaremos

### Paso 3.6: Configurar Webhook en Stripe (Continuación)

Ahora volvemos a Stripe:

1. Ve a **Stripe Dashboard** → **Developers** → **Webhooks**
2. Click **"Add endpoint"**
3. En **"Endpoint URL"** pega:
   ```
   https://cause4all-mvp-xxxxx.vercel.app/api/webhook
   ```
   (Reemplaza con TU URL de Vercel + /api/webhook al final)

4. Click en **"Select events"**
5. Busca y marca estos 3 eventos:
   - ✅ checkout.session.completed
   - ✅ payment_intent.payment_failed
   - ✅ payment_intent.succeeded

6. Click **"Add events"**
7. Click **"Add endpoint"**
8. **Copia el "Signing secret"** (empieza con `whsec_...`)

### Paso 3.7: Actualizar Variable de Webhook

1. Vuelve a **Vercel Dashboard**
2. Click en tu proyecto → **"Settings"** → **"Environment Variables"**
3. Busca **`STRIPE_WEBHOOK_SECRET`**
4. Click en los 3 puntitos → **"Edit"**
5. **Reemplaza** `whsec_temporal_dejalo_vacio_por_ahora` con el webhook secret real de Stripe
6. Click **"Save"**
7. En el menú arriba → **"Deployments"**
8. Click en los 3 puntitos del deployment más reciente → **"Redeploy"**
9. **Espera 1-2 minutos**

---

## Parte 4: Crear tu Primera Campaña

### Paso 4.1: Crear Organización

1. Ve a tu web: `https://cause4all-mvp-xxxxx.vercel.app`
2. Click en **"Admin"** (en el menú)
3. Si ves la página del admin, ¡perfecto! ✅

Ahora vamos a crear la organización directamente en Supabase:

1. Ve a **Supabase Dashboard** → **Table Editor** → **organizations**
2. Click en **"Insert"** → **"Insert row"**
3. Completa:
   ```
   name: Club Deportivo Test
   type: asociacion
   email: test@club.com
   location: Barcelona
   description: Club de prueba
   ```
4. Click **"Save"**

### Paso 4.2: Crear Primera Campaña

1. Vuelve a tu web → Admin
2. Deberías ver "Organizaciones: 1"
3. Click en **"+ Nueva Campaña"**
4. Completa el formulario:

```
Organización: Club Deportivo Test
Título: Campaña de Prueba
Subtítulo: Mi primera campaña
Descripción: Esta es una campaña de prueba para verificar que todo funciona correctamente.
Tipo de causa: Deportiva
Meta de recaudación: 1000
Imagen de campaña: https://i.imgur.com/rDfAtGC.jpg (ejemplo de esquí)
Premio del sorteo: Tablet
Fecha del sorteo: [Elige una fecha futura]
```

5. Click **"Crear campaña"**
6. Deberías ver tu campaña en la lista ✅

### Paso 4.3: Ver Landing Page

1. En la lista de campañas, click en **"Ver"**
2. Se abrirá la landing page de tu campaña
3. Deberías ver:
   - ✅ Título
   - ✅ Imagen (o placeholder de montañas)
   - ✅ Barra de progreso
   - ✅ Opciones de donación
   - ✅ Botón "Participar ahora"

---

## Parte 5: Testing Completo

### Paso 5.1: Hacer un Pago de Prueba

⚠️ **IMPORTANTE**: Usa tarjetas de prueba de Stripe, no cobran dinero real

1. En tu landing page, click **"Participar ahora"**
2. Se abrirá Stripe Checkout
3. Completa con datos de prueba:

```
Email: test@example.com
Número de tarjeta: 4242 4242 4242 4242
Fecha: 12/34 (cualquier fecha futura)
CVC: 123
Nombre: Test User
```

4. Click **"Pay"** / **"Pagar"**
5. Deberías ser redirigido a página de éxito ✅

### Paso 5.2: Verificar que Funcionó

**1. Verificar en Stripe:**
- Ve a Stripe Dashboard
- Deberías ver el pago en "Payments"
- Estado: Succeeded ✅

**2. Verificar en Supabase:**
- Ve a Supabase → Table Editor → **donations**
- Deberías ver 1 fila nueva con tu donación ✅
- Ve a **campaigns**
- El `current_amount` debería haber aumentado ✅

**3. Verificar en tu Landing:**
- Recarga la página de la campaña
- La barra de progreso debería mostrar el nuevo total ✅
- El contador de "participantes" debería aumentar ✅

### Paso 5.3: Verificar Webhook

1. Ve a Stripe Dashboard → Developers → Webhooks
2. Click en tu endpoint
3. Deberías ver eventos recientes con ✅ (200 OK)
4. Si ves errores ❌, revisa la sección de Solución de Problemas

### Paso 5.4: Probar Tarjeta Rechazada

1. Haz otro intento de pago
2. Usa esta tarjeta: `4000 0000 0000 0002`
3. El pago debería fallar
4. Verifica en Stripe → Webhooks que se registró el error

---

## Solución de Problemas

### ❌ Error: "Cannot connect to Supabase"

**Causa**: Variables de entorno mal configuradas

**Solución**:
1. Ve a Vercel → Settings → Environment Variables
2. Verifica que:
   - `NEXT_PUBLIC_SUPABASE_URL` empiece con `https://`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` sea la key "anon" (no la "service_role")
3. Redeploy el proyecto

### ❌ Error: "Stripe publishable key invalid"

**Causa**: Publishable key incorrecta o mezclaste test/live

**Solución**:
1. Verifica que estés en "Modo de prueba" en Stripe
2. Ve a Vercel → Settings → Environment Variables
3. Verifica que `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` empiece con `pk_test_`
4. Redeploy

### ❌ Webhook no funciona (pago no se registra)

**Causa**: Webhook secret incorrecto

**Solución**:
1. Ve a Stripe → Developers → Webhooks
2. Click en tu endpoint
3. Copia el "Signing secret"
4. Ve a Vercel → Settings → Environment Variables
5. Actualiza `STRIPE_WEBHOOK_SECRET`
6. Redeploy

### ❌ "No organizations found" en el admin

**Causa**: No has creado ninguna organización

**Solución**:
1. Ve a Supabase → Table Editor → organizations
2. Click "Insert row"
3. Añade una organización manualmente

### ❌ Las imágenes no se cargan

**Causa**: URL incorrecta o imagen privada

**Solución**:
1. Verifica que la URL empiece con `https://`
2. Abre la URL en una pestaña nueva
3. Si no se ve, la imagen es privada o la URL es incorrecta
4. Sube a Imgur: https://imgur.com/upload

### ❌ "Build failed" en Vercel

**Causa**: Error en el código o dependencias

**Solución**:
1. Ve a Vercel → Deployments → Click en el deployment fallido
2. Mira los logs para ver el error
3. Contacta con soporte (probablemente un archivo falta)

---

## 🎯 Checklist Final

Antes de considerar que todo está listo:

- [ ] ✅ Supabase creado con 3 tablas
- [ ] ✅ Stripe configurado en modo test
- [ ] ✅ Vercel desplegado y funcionando
- [ ] ✅ Webhook configurado y funcionando
- [ ] ✅ Primera organización creada
- [ ] ✅ Primera campaña creada
- [ ] ✅ Pago de prueba realizado exitosamente
- [ ] ✅ Donación registrada en Supabase
- [ ] ✅ Total de campaña actualizado
- [ ] ✅ Webhook mostrando 200 OK en Stripe

Si todos tienen ✅, **¡felicidades! Tu plataforma está funcionando.** 🎉

---

## 📊 Próximos Pasos

### Producción Real

Cuando estés listo para lanzar:

1. **Stripe:**
   - Completa verificación de cuenta
   - Activa "Modo en vivo"
   - Obtén nuevas keys (pk_live_ y sk_live_)
   - Crea nuevo webhook para producción

2. **Vercel:**
   - Conecta tu dominio personalizado (cause4all.com)
   - Actualiza variables de entorno con keys de producción

3. **Supabase:**
   - Considera plan Pro si superas 500MB
   - Habilita backups automáticos
   - Revisa políticas de seguridad (RLS)

### Marketing y Lanzamiento

1. Crea 2-3 campañas demo con datos reales
2. Toma screenshots de calidad
3. Prepara pitch deck para clubes
4. Contacta primeros pilotos

---

## 🆘 Soporte

Si te quedas atascado:

1. **Revisa logs**:
   - Vercel: Deployments → Click en deployment → Function logs
   - Stripe: Webhooks → tu endpoint → eventos recientes
   - Supabase: Table Editor → verifica datos

2. **Documentación**:
   - WEBHOOK_GUIDE.md - Problemas con pagos
   - IMAGES_GUIDE.md - Problemas con imágenes
   - README.md - Información general

3. **Testing**:
   - Usa siempre tarjetas de prueba de Stripe
   - Verifica modo test está activado
   - Revisa que URLs no tengan espacios

---

**¡Éxito con tu lanzamiento! 🚀**

*Esta guía te llevó de cero a plataforma funcionando en ~45 minutos.*
*Ahora tienes un sistema completo de recaudación de fondos listo para pilotos reales.*
