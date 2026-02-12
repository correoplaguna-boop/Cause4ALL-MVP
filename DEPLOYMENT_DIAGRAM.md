# 📊 Diagrama de Implementación - Cause4All

## Flujo de Deployment Completo

```
┌─────────────────────────────────────────────────────────────┐
│                    INICIO: 0 minutos                         │
│              Tienes el ZIP descargado                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│          PARTE 1: SUPABASE (Base de Datos)                   │
│                   Tiempo: 10 minutos                         │
├─────────────────────────────────────────────────────────────┤
│  1. Crear cuenta en supabase.com                            │
│  2. Crear proyecto nuevo                                     │
│  3. Copiar Project URL + anon key                           │
│  4. SQL Editor → Pegar schema.sql → Run                     │
│  5. SQL Editor → Pegar storage-setup.sql → Run              │
│                                                              │
│  ✅ Resultado: Base de datos lista con 3 tablas             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│           PARTE 2: STRIPE (Pagos)                            │
│                   Tiempo: 5 minutos                          │
├─────────────────────────────────────────────────────────────┤
│  1. Crear cuenta en stripe.com                              │
│  2. Activar "Modo de prueba"                                │
│  3. Developers → API keys                                    │
│  4. Copiar pk_test_ y sk_test_                              │
│  5. Developers → Webhooks (guardar para después)            │
│                                                              │
│  ✅ Resultado: Stripe configurado para testing              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│       PARTE 3: GITHUB + VERCEL (Código + Hosting)           │
│                   Tiempo: 15 minutos                         │
├─────────────────────────────────────────────────────────────┤
│  GITHUB:                                                     │
│  1. Crear cuenta github.com                                 │
│  2. New repository → cause4all-mvp                          │
│  3. Upload files → arrastra carpeta descomprimida           │
│                                                              │
│  VERCEL:                                                     │
│  4. Crear cuenta vercel.com (con GitHub)                    │
│  5. New Project → Importar cause4all-mvp                    │
│  6. Añadir 5 variables de entorno:                          │
│     - NEXT_PUBLIC_SUPABASE_URL                              │
│     - NEXT_PUBLIC_SUPABASE_ANON_KEY                         │
│     - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY                    │
│     - STRIPE_SECRET_KEY                                      │
│     - STRIPE_WEBHOOK_SECRET (temporal)                       │
│  7. Deploy → Copiar URL generada                            │
│                                                              │
│  ✅ Resultado: Web funcionando en tu-url.vercel.app         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│       PARTE 4: WEBHOOK STRIPE (Conectar pagos)               │
│                   Tiempo: 5 minutos                          │
├─────────────────────────────────────────────────────────────┤
│  1. Stripe → Webhooks → Add endpoint                        │
│  2. URL: tu-url.vercel.app/api/webhook                      │
│  3. Eventos: checkout.session.completed + 2 más             │
│  4. Copiar webhook secret (whsec_...)                       │
│  5. Vercel → Settings → Environment Variables               │
│  6. Actualizar STRIPE_WEBHOOK_SECRET con el real            │
│  7. Redeploy                                                 │
│                                                              │
│  ✅ Resultado: Pagos conectados con base de datos           │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│       PARTE 5: PRIMERA CAMPAÑA (Testing)                     │
│                   Tiempo: 10 minutos                         │
├─────────────────────────────────────────────────────────────┤
│  1. Supabase → organizations → Insert row                   │
│     (crear organización de prueba)                          │
│  2. tu-url.vercel.app/admin                                 │
│  3. + Nueva Campaña → Completar formulario                  │
│  4. Ver landing page de campaña                             │
│  5. Hacer pago de prueba (4242 4242 4242 4242)             │
│  6. Verificar en Supabase que se registró                   │
│                                                              │
│  ✅ Resultado: Primera campaña funcionando                  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  🎉 ÉXITO: 45 minutos                        │
│       Plataforma completa funcionando con pagos reales       │
│                                                              │
│  Tienes:                                                     │
│  ✅ Base de datos con 3 tablas                              │
│  ✅ Sistema de pagos Stripe                                 │
│  ✅ Web pública accesible                                   │
│  ✅ Admin panel para gestión                                │
│  ✅ Primera campaña de prueba                               │
│  ✅ Webhook funcionando                                     │
│                                                              │
│  Siguiente paso: Crear campañas reales y pilotos           │
└─────────────────────────────────────────────────────────────┘
```

---

## Arquitectura del Sistema

```
┌──────────────────┐
│   USUARIO WEB    │  Visita: tu-url.vercel.app/c/campana
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────────────────────────┐
│            VERCEL (Frontend + API)                │
│                                                   │
│  - Next.js App Router                            │
│  - Landing Pages (/c/[slug])                     │
│  - Panel Admin (/admin)                          │
│  - API Routes (/api/*)                           │
└───────┬─────────────────────────┬────────────────┘
        │                         │
        │                         │
        ▼                         ▼
┌──────────────────┐      ┌─────────────────┐
│    SUPABASE      │      │     STRIPE      │
│  (PostgreSQL)    │      │   (Payments)    │
│                  │      │                 │
│ • organizations  │      │ • Checkout      │
│ • campaigns      │◄─────┤ • Webhooks      │
│ • donations      │      │ • Test cards    │
│ • storage        │      └─────────────────┘
└──────────────────┘
```

---

## Flujo de una Donación

```
1. USUARIO click "Participar ahora" en landing
   │
   ▼
2. FRONTEND llama a /api/checkout
   │
   ▼
3. API crea sesión en Stripe
   │
   ▼
4. STRIPE redirige a Checkout
   │
   ▼
5. USUARIO ingresa tarjeta y paga
   │
   ▼
6. STRIPE procesa el pago
   │
   ▼
7. STRIPE envía webhook a /api/webhook
   │
   ▼
8. WEBHOOK registra en Supabase:
   - Crea registro en 'donations'
   - Actualiza 'campaigns.current_amount'
   │
   ▼
9. STRIPE redirige a /success
   │
   ▼
10. USUARIO ve confirmación ✅
```

---

## Variables de Entorno Requeridas

```
┌───────────────────────────────────────────────────────────┐
│  Variable                           │  Dónde conseguirla  │
├─────────────────────────────────────┼─────────────────────┤
│ NEXT_PUBLIC_SUPABASE_URL            │ Supabase Settings   │
│ NEXT_PUBLIC_SUPABASE_ANON_KEY       │ Supabase Settings   │
│ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY  │ Stripe API keys     │
│ STRIPE_SECRET_KEY                   │ Stripe API keys     │
│ STRIPE_WEBHOOK_SECRET               │ Stripe Webhooks     │
└─────────────────────────────────────┴─────────────────────┘

⚠️ IMPORTANTE:
- Las que empiezan con NEXT_PUBLIC_ son visibles en el frontend
- STRIPE_SECRET_KEY nunca debe exponerse públicamente
- STRIPE_WEBHOOK_SECRET valida que eventos vienen de Stripe
```

---

## Estructura de Archivos

```
cause4all-mvp/
│
├── 📄 Documentación
│   ├── README.md              ← Información general
│   ├── DEPLOY_GUIDE.md        ← Implementación paso a paso
│   ├── WEBHOOK_GUIDE.md       ← Guía del webhook
│   ├── IMAGES_GUIDE.md        ← Gestión de imágenes
│   └── CHANGELOG.md           ← Historial de cambios
│
├── 🗄️ Base de Datos
│   └── supabase/
│       ├── schema.sql         ← Crear tablas
│       └── storage-setup.sql  ← Configurar imágenes
│
├── 💻 Código Fuente
│   └── src/
│       ├── app/
│       │   ├── page.tsx              ← Homepage
│       │   ├── admin/page.tsx        ← Panel admin
│       │   ├── c/[slug]/page.tsx     ← Landing campaña
│       │   ├── success/page.tsx      ← Confirmación
│       │   └── api/
│       │       ├── checkout/         ← Crear pago
│       │       ├── webhook/          ← Recibir eventos
│       │       └── verify-payment/   ← Verificar pago
│       ├── components/
│       │   └── CampaignLanding.tsx   ← Componente principal
│       └── lib/
│           ├── supabase.ts           ← Cliente DB
│           └── stripe.ts             ← Cliente pagos
│
└── ⚙️ Configuración
    ├── package.json           ← Dependencias
    ├── next.config.js         ← Config Next.js
    └── .env.example           ← Template variables
```

---

## Checklist de Deployment

### Pre-deployment
- [ ] Cuenta Supabase creada
- [ ] Cuenta Stripe creada
- [ ] Cuenta GitHub creada
- [ ] Cuenta Vercel creada
- [ ] Código descargado y descomprimido

### Supabase
- [ ] Proyecto creado
- [ ] schema.sql ejecutado
- [ ] storage-setup.sql ejecutado (opcional)
- [ ] Credenciales copiadas

### Stripe
- [ ] Modo test activado
- [ ] API keys copiadas
- [ ] Webhook creado (después de Vercel)

### Vercel
- [ ] Código subido a GitHub
- [ ] Proyecto importado
- [ ] Variables de entorno configuradas
- [ ] Primera deploy exitosa
- [ ] URL copiada

### Testing
- [ ] Admin panel accesible
- [ ] Organización creada en Supabase
- [ ] Primera campaña creada
- [ ] Landing page visible
- [ ] Pago de prueba exitoso
- [ ] Donación registrada en Supabase
- [ ] Webhook mostrando 200 OK

---

## Tiempos Estimados

```
Tarea                          │ Tiempo    │ Acumulado
───────────────────────────────┼───────────┼──────────
Crear cuenta Supabase          │ 3 min     │ 3 min
Configurar base de datos       │ 7 min     │ 10 min
Crear cuenta Stripe            │ 5 min     │ 15 min
Subir código a GitHub          │ 5 min     │ 20 min
Configurar Vercel              │ 10 min    │ 30 min
Configurar webhook             │ 5 min     │ 35 min
Testing completo               │ 10 min    │ 45 min
───────────────────────────────┴───────────┴──────────
TOTAL                                      │ 45 min ✅
```

---

## Costos

```
Servicio    │ Plan      │ Costo         │ Límites
────────────┼───────────┼───────────────┼─────────────────────
Supabase    │ Free      │ 0€/mes        │ 500MB DB, 1GB storage
Vercel      │ Free      │ 0€/mes        │ 100GB bandwidth
Stripe      │ Pay-as-go │ 1.5% + 0.25€  │ Por transacción
GitHub      │ Free      │ 0€/mes        │ Repos públicos ilimitados
────────────┴───────────┴───────────────┴─────────────────────

💰 EJEMPLO:
Si recaudas 1,000€ en un mes:
- Stripe fees: ~15€
- Supabase: 0€ (dentro del free tier)
- Vercel: 0€ (dentro del free tier)
- GitHub: 0€

TOTAL COSTOS: ~15€ (1.5% del volumen)
```

---

## FAQ Deployment

**P: ¿Necesito saber programar?**
R: No. Esta guía asume cero conocimientos técnicos.

**P: ¿Cuánto tiempo tarda?**
R: 45 minutos siguiendo la guía paso a paso.

**P: ¿Cuánto cuesta?**
R: 0€ fijos. Solo pagas comisiones por transacción (1.5%).

**P: ¿Qué pasa si me quedo atascado?**
R: Revisa la sección "Solución de Problemas" en DEPLOY_GUIDE.md

**P: ¿Puedo usar mi propio dominio?**
R: Sí. En Vercel Settings → Domains → Add cause4all.com

**P: ¿Es seguro?**
R: Sí. Stripe maneja los datos de tarjetas, nosotros solo guardamos referencias.

**P: ¿Funciona en móvil?**
R: Sí. Todo el diseño es responsive.

**P: ¿Puedo probar sin cobrar dinero real?**
R: Sí. Usa el modo test de Stripe con tarjetas de prueba.

---

**Siguiente paso**: Abre [DEPLOY_GUIDE.md](DEPLOY_GUIDE.md) y comienza 🚀
