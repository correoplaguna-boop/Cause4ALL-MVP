# Cause4All MVP

Plataforma de recaudación de fondos para organizaciones sin ánimo de lucro mediante venta de productos + donaciones opcionales con sorteo promocional.

## 🎯 Características Principales

- **Campañas personalizables**: Crea campañas en menos de 10 minutos
- **Sistema dual**: Producto físico (2,50€) + donación opcional (personalizable)
- **Sorteos legales**: Cumple con Ley 13/2011 española (promoción, no juego de azar)
- **Panel admin**: Gestión completa de campañas y organizaciones
- **Pagos Stripe**: Integración completa con webhooks mejorados
- **Landing pages dinámicas**: URLs personalizadas por campaña (cause4all.com/c/tu-campana)

## 🚀 Mejoras Implementadas

### v1.1 (Última actualización)
- ✅ Rebrand completo: Change4All → Cause4All
- ✅ Campo de título de campaña ahora es de escritura libre (no desplegable)
- ✅ Webhook mejorado con:
  - Logging detallado de todos los eventos
  - Manejo robusto de errores
  - Validación de metadata
  - Tracking de payment_intent.succeeded
  - Mensajes de error informativos

## 📦 Stack Tecnológico

- **Frontend**: Next.js 14 (App Router), React, TailwindCSS
- **Backend**: Next.js API Routes, Supabase (PostgreSQL)
- **Pagos**: Stripe Checkout + Webhooks
- **Deploy**: Vercel (recomendado)

## 🛠 Instalación

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env.local

# 3. Ejecutar en desarrollo
npm run dev
```

## ⚙️ Variables de Entorno

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=tu_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## 🔧 Configuración de Stripe Webhook

1. **En Stripe Dashboard** → Developers → Webhooks
2. **Add endpoint**: `https://tu-dominio.com/api/webhook`
3. **Eventos a escuchar**:
   - `checkout.session.completed`
   - `payment_intent.payment_failed`
   - `payment_intent.succeeded`
4. **Copiar** Signing secret → `STRIPE_WEBHOOK_SECRET`

### Testing local del webhook
```bash
# Instalar Stripe CLI
stripe listen --forward-to localhost:3000/api/webhook

# El CLI te dará un webhook secret temporal
# Úsalo en STRIPE_WEBHOOK_SECRET para testing
```

## 📊 Base de Datos (Supabase)

```sql
-- Ver archivo supabase/schema.sql para el schema completo
-- Tablas principales:
-- - organizations: Entidades beneficiarias
-- - campaigns: Campañas de recaudación
-- - donations: Registro de donaciones/compras
```

## 🎨 Estructura del Proyecto

```
cause4all-mvp/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Homepage
│   │   ├── admin/page.tsx        # Panel admin (crear/editar campañas)
│   │   ├── c/[slug]/page.tsx     # Landing page dinámica por campaña
│   │   ├── success/page.tsx      # Página de confirmación
│   │   └── api/
│   │       ├── checkout/         # Crear sesión de pago
│   │       ├── verify-payment/   # Verificar pago completado
│   │       └── webhook/          # Webhook de Stripe (MEJORADO ✨)
│   ├── components/
│   │   └── CampaignLanding.tsx   # Componente principal de campaña
│   └── lib/
│       ├── stripe.ts             # Cliente de Stripe
│       └── supabase.ts           # Cliente de Supabase
└── supabase/
    └── schema.sql                # Schema de base de datos
```

## 🔐 Cumplimiento Legal

El modelo está diseñado para cumplir con la **Ley 13/2011** española:
- Participación en sorteo deriva de la **compra del producto** (2,50€)
- La donación es **opcional** y puede desmarcarse
- No se cobra por participar en el sorteo
- Sistema de promoción comercial, NO juego de azar

## 📈 Roadmap

### Año 1: 20 campañas
- Pilotos con clubes deportivos
- Validación del modelo
- Refinamiento de procesos

### Año 2: 250 campañas
- Partnerships con federaciones (FAPAC)
- Escalado de operaciones
- Ampliación a AMPAs

### Año 3: 1,000 campañas
- Expansión nacional
- Automatización completa
- Nuevos verticales

## 🤝 Próximos Pasos

1. ✅ Validación legal con G-Valdecasas & Viola
2. 🎯 Primer piloto con club deportivo
3. 📊 Tracking y analytics
4. 🚀 Automatización de fulfillment

## 📞 Contacto

Para consultas: [tu-email]@cause4all.com
Web: https://cause4all.com

---

**Última actualización**: Febrero 2025  
**Versión**: 1.1 (Webhook mejorado + Rebrand completo)

Plataforma de campañas solidarias para colegios, AMPAs y asociaciones.

## 🚀 Quick Start (30 minutos)

### 1. Configurar Supabase (10 min)

1. Crea cuenta en [supabase.com](https://supabase.com) (gratis)
2. Crea un nuevo proyecto
3. Ve a **SQL Editor** y ejecuta el contenido de `supabase/schema.sql`
4. Ve a **Settings > API** y copia:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 2. Configurar Stripe (10 min)

1. Crea cuenta en [stripe.com](https://stripe.com)
2. Ve a **Developers > API Keys**
3. Copia (usa las TEST keys para desarrollo):
   - `Publishable key` → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `Secret key` → `STRIPE_SECRET_KEY`

### 3. Configurar el proyecto (5 min)

```bash
# Clonar/descomprimir el proyecto
cd change4all-mvp

# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env.local

# Editar .env.local con tus claves
```

### 4. Ejecutar en local

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

### 5. Desplegar en Vercel (5 min)

1. Sube el proyecto a GitHub
2. Ve a [vercel.com](https://vercel.com) y conecta el repo
3. Añade las variables de entorno en Vercel
4. Deploy!

---

## 📁 Estructura del proyecto

```
change4all-mvp/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Home - listado de campañas
│   │   ├── admin/page.tsx        # Panel de administración
│   │   ├── success/page.tsx      # Página post-pago
│   │   ├── c/[slug]/page.tsx     # Landing de campaña
│   │   └── api/
│   │       ├── checkout/         # Crear sesión Stripe
│   │       ├── verify-payment/   # Verificar pago
│   │       └── webhook/          # Webhook de Stripe
│   ├── components/
│   │   └── CampaignLanding.tsx   # Componente landing
│   └── lib/
│       ├── supabase.ts           # Cliente y helpers BD
│       └── stripe.ts             # Cliente y helpers pagos
├── supabase/
│   └── schema.sql                # Esquema de base de datos
├── .env.example                  # Template variables entorno
└── README.md
```

---

## 🔧 Configuración del Webhook de Stripe

Para que las donaciones se registren automáticamente:

### En desarrollo (con Stripe CLI)

```bash
# Instalar Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Escuchar webhooks localmente
stripe listen --forward-to localhost:3000/api/webhook
```

Copia el `webhook signing secret` que aparece → `STRIPE_WEBHOOK_SECRET`

### En producción (Vercel)

1. Ve a Stripe Dashboard > Developers > Webhooks
2. Add endpoint: `https://tu-dominio.vercel.app/api/webhook`
3. Selecciona eventos:
   - `checkout.session.completed`
   - `payment_intent.payment_failed`
4. Copia el signing secret → `STRIPE_WEBHOOK_SECRET`

---

## 📊 Base de datos

### Tablas principales

| Tabla | Descripción |
|-------|-------------|
| `organizations` | Colegios, AMPAs, asociaciones |
| `campaigns` | Campañas solidarias |
| `donations` | Registro de donaciones |

### Diagrama

```
organizations (1) ──────< (N) campaigns (1) ──────< (N) donations
```

---

## 🎨 Personalización

### Colores (tailwind.config.ts)

```javascript
colors: {
  primary: {
    400: '#FF8A65',  // Naranja claro
    500: '#FF6B6B',  // Coral
  }
}
```

### Fuentes

- **Display**: Fraunces (títulos)
- **Body**: DM Sans (texto)

Ambas se cargan desde Google Fonts en `globals.css`.

---

## 🔒 Seguridad

### Row Level Security (RLS)

Supabase tiene RLS activado. Las políticas actuales permiten:
- ✅ Lectura pública de campañas y organizaciones
- ✅ Inserción de donaciones (vía API)
- ⚠️ El panel admin es público (añadir auth para producción)

### Para añadir autenticación al admin

1. Configura Supabase Auth
2. Añade middleware en `src/middleware.ts`
3. Actualiza las políticas RLS

---

## 📱 URLs del proyecto

| Ruta | Descripción |
|------|-------------|
| `/` | Home con listado de campañas |
| `/c/[slug]` | Landing de campaña específica |
| `/admin` | Panel de administración |
| `/success` | Página de éxito post-pago |

---

## 🚀 Roadmap MVP

### ✅ Fase 1 (Actual)
- [x] Landing dinámica por campaña
- [x] Integración Stripe Checkout
- [x] Panel admin básico
- [x] Base de datos Supabase

### 📋 Fase 2 (Próximo)
- [ ] Autenticación admin
- [ ] Subida de imágenes
- [ ] Emails transaccionales (Resend)
- [ ] Dashboard de métricas

### 📋 Fase 3 (Futuro)
- [ ] Sistema de sorteos automático
- [ ] Multi-idioma
- [ ] App móvil

---

## 🆘 Troubleshooting

### "Error al crear checkout session"
- Verifica que `STRIPE_SECRET_KEY` está configurado
- Asegúrate de usar keys de TEST en desarrollo

### "Campaña no encontrada"
- Verifica que el slug existe en la BD
- Comprueba que el status es `active`

### "Las donaciones no se registran"
- Configura el webhook de Stripe
- Verifica `STRIPE_WEBHOOK_SECRET`

---

## 📞 Soporte

¿Problemas? Abre un issue o contacta en soporte@change4all.es

---

## 📄 Licencia

MIT - Usa este código como quieras.
