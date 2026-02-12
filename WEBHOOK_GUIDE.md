# 🔗 Guía del Webhook de Stripe - Cause4All

## 📋 Índice
1. [¿Qué hace el webhook?](#qué-hace-el-webhook)
2. [Eventos que procesa](#eventos-que-procesa)
3. [Configuración paso a paso](#configuración-paso-a-paso)
4. [Testing local](#testing-local)
5. [Logs y debugging](#logs-y-debugging)
6. [Solución de problemas](#solución-de-problemas)

---

## ¿Qué hace el webhook?

El webhook es el "puente" entre Stripe y tu aplicación. Cuando un usuario completa un pago en Stripe, el webhook:

1. ✅ Recibe la confirmación de pago de Stripe
2. ✅ Verifica que la petición es auténtica (firma de seguridad)
3. ✅ Registra la donación en Supabase
4. ✅ Actualiza el total recaudado de la campaña
5. ✅ Loggea todo el proceso para debugging

### Flujo de datos
```
Usuario paga en Stripe
    ↓
Stripe confirma pago
    ↓
Stripe envía evento a tu webhook
    ↓
Webhook verifica firma
    ↓
Webhook registra donación en Supabase
    ↓
Webhook actualiza total de campaña
    ↓
Responde a Stripe: ✅ Recibido
```

---

## Eventos que procesa

### 1. `checkout.session.completed` ⭐ (Principal)
**Cuándo se dispara**: Cuando el usuario completa el checkout de Stripe

**Qué hace el webhook**:
```javascript
- Extrae metadata: campaign_id, donation_amount, product_amount
- Calcula total: amount_total / 100 (Stripe usa centavos)
- Crea registro en tabla 'donations':
  ├─ campaign_id
  ├─ amount (total)
  ├─ donation_portion (5€, 7.50€, etc)
  ├─ product_portion (2.50€)
  ├─ email del cliente
  ├─ stripe_payment_id
  ├─ stripe_session_id
  ├─ enters_draw: true
  └─ status: 'completed'
- Actualiza current_amount en tabla 'campaigns'
```

**Logs generados**:
```
[Webhook] Event verified: checkout.session.completed ID: evt_xxx
[Webhook] Processing checkout.session.completed: cs_xxx
[Webhook] Payment details: { campaignId, totalAmount, donationAmount, ... }
[Webhook] Donation recorded successfully: don_xxx
[Webhook] Campaign amount updated successfully
[Webhook] Checkout session processed successfully
```

### 2. `payment_intent.payment_failed` ⚠️
**Cuándo se dispara**: Cuando falla un pago (tarjeta rechazada, fondos insuficientes, etc)

**Qué hace el webhook**:
```javascript
- Loggea el error con detalles:
  ├─ ID del payment intent
  ├─ Monto que intentó pagar
  ├─ Moneda
  └─ Mensaje de error específico
```

**Logs generados**:
```
[Webhook] Payment failed: {
  id: 'pi_xxx',
  amount: 7.50,
  currency: 'eur',
  last_error: 'Your card was declined.'
}
```

### 3. `payment_intent.succeeded` ✅
**Cuándo se dispara**: Cuando un payment intent se completa exitosamente

**Qué hace el webhook**:
```javascript
- Loggea confirmación de pago exitoso
- Útil para tracking y analytics
```

**Logs generados**:
```
[Webhook] Payment succeeded: { id: 'pi_xxx', amount: 7.50 }
```

---

## Configuración paso a paso

### Paso 1: Obtener webhook secret de Stripe

1. Ve a: https://dashboard.stripe.com/webhooks
2. Click en **"Add endpoint"**
3. URL del endpoint:
   - Producción: `https://tu-dominio.com/api/webhook`
   - Staging: `https://tu-dominio-staging.vercel.app/api/webhook`
4. Selecciona estos eventos:
   ```
   ✅ checkout.session.completed
   ✅ payment_intent.payment_failed
   ✅ payment_intent.succeeded
   ```
5. Click **"Add endpoint"**
6. Copia el **Signing secret** (empieza con `whsec_...`)

### Paso 2: Configurar variable de entorno

En tu archivo `.env.local` (desarrollo) o Vercel (producción):
```env
STRIPE_WEBHOOK_SECRET=whsec_tu_secret_aqui
```

### Paso 3: Verificar que funciona

Después de configurar, haz un pago de prueba y verifica:

1. En **Stripe Dashboard** → Webhooks → tu endpoint:
   - Deberías ver eventos con ✅ (200 OK)
   
2. En **logs de tu aplicación** (Vercel logs):
   ```
   [Webhook] Received request
   [Webhook] Event verified: checkout.session.completed
   [Webhook] Processing checkout.session.completed: cs_test_...
   [Webhook] Donation recorded successfully
   [Webhook] Campaign amount updated successfully
   ```

3. En **Supabase** → Table Editor:
   - Tabla `donations`: Nuevo registro con el pago
   - Tabla `campaigns`: `current_amount` actualizado

---

## Testing local

### Opción 1: Stripe CLI (Recomendado)

```bash
# 1. Instalar Stripe CLI
# Mac:
brew install stripe/stripe-cli/stripe

# Windows/Linux:
# Descargar de: https://stripe.com/docs/stripe-cli

# 2. Login
stripe login

# 3. Forward eventos a localhost
stripe listen --forward-to localhost:3000/api/webhook

# 4. Copiar el webhook secret que te muestra
# (empieza con whsec_...)

# 5. Añadirlo a .env.local
STRIPE_WEBHOOK_SECRET=whsec_el_que_te_dio_stripe_cli
```

Ahora cuando hagas un pago de prueba en `localhost:3000`, los eventos llegarán a tu webhook local.

### Opción 2: ngrok (Alternativa)

```bash
# 1. Instalar ngrok
npm install -g ngrok

# 2. Exponer localhost
ngrok http 3000

# 3. Copiar URL (ej: https://abc123.ngrok.io)

# 4. En Stripe Dashboard, crear webhook con URL:
https://abc123.ngrok.io/api/webhook

# 5. Usar el webhook secret de Stripe Dashboard
```

---

## Logs y debugging

El webhook mejorado tiene logging completo en cada paso:

### Estructura de logs
```javascript
[Webhook] <Paso> <Detalles>

Ejemplos:
[Webhook] Received request                           // Inició petición
[Webhook] Event verified: checkout.session.completed  // Firma OK
[Webhook] Processing checkout.session.completed      // Comenzó proceso
[Webhook] Payment details: { ... }                   // Datos del pago
[Webhook] Donation recorded successfully             // Guardado en DB
[Webhook] Campaign amount updated successfully       // Total actualizado
[Webhook] Checkout session processed successfully    // Todo OK
```

### Dónde ver los logs

**Desarrollo (local)**:
```bash
# En tu terminal donde corre npm run dev
# Los logs aparecen en tiempo real
```

**Producción (Vercel)**:
```bash
# 1. Vercel Dashboard → tu proyecto → Logs
# 2. O con CLI:
vercel logs --follow

# Filtrar solo webhook:
vercel logs --follow | grep "\[Webhook\]"
```

### Ejemplo de logs exitosos
```
[Webhook] Received request
[Webhook] Event verified: checkout.session.completed ID: evt_1QYYjYGq...
[Webhook] Processing checkout.session.completed: cs_test_a1PnrBVYxdcY...
[Webhook] Payment details: {
  campaignId: '123e4567-e89b-12d3-a456-426614174000',
  totalAmount: 7.5,
  donationAmount: 5,
  productAmount: 2.5,
  email: 'cliente@example.com'
}
[Webhook] Donation recorded successfully: don_abc123
[Webhook] Campaign amount updated successfully
[Webhook] Checkout session processed successfully
```

---

## Solución de problemas

### ❌ Error: "Missing signature"
**Causa**: Stripe no está enviando la firma o la petición no viene de Stripe

**Solución**:
1. Verifica que la URL del webhook en Stripe sea correcta
2. Asegúrate de que `STRIPE_WEBHOOK_SECRET` esté configurado
3. No pruebes el webhook llamándolo manualmente con Postman

### ❌ Error: "Invalid signature"
**Causa**: El `STRIPE_WEBHOOK_SECRET` es incorrecto

**Solución**:
1. Ve a Stripe Dashboard → Webhooks → tu endpoint
2. Copia el **Signing secret** exacto
3. Actualiza `STRIPE_WEBHOOK_SECRET` en `.env.local` o Vercel
4. Reinicia tu aplicación

### ❌ Error: "Missing campaign_id"
**Causa**: El metadata de la sesión de Stripe no incluye `campaign_id`

**Solución**:
1. Verifica que en `/api/checkout/route.ts` se esté enviando:
   ```javascript
   metadata: {
     campaign_id: '...',
     donation_amount: '...',
     product_amount: '...'
   }
   ```

### ❌ Error: "Failed to record donation"
**Causa**: Error al guardar en Supabase

**Solución**:
1. Verifica credenciales de Supabase en `.env`
2. Revisa que el schema de la tabla `donations` sea correcto
3. Mira logs de Supabase para más detalles

### ⚠️ Webhook retorna 200 pero no se guarda nada
**Causa**: El evento no es `checkout.session.completed` o el pago no está marcado como `paid`

**Solución**:
1. Revisa los logs: `[Webhook] Unhandled event type: xxx`
2. Asegúrate de que seleccionaste `checkout.session.completed` en Stripe Dashboard
3. Verifica que `payment_status === 'paid'` en el log

### 🔄 Stripe reintenta el webhook
**Causa**: Tu webhook no respondió con status 200 a tiempo

**Lo que hace Stripe**:
- Intenta enviar el evento hasta 3 veces
- Con delays exponenciales

**Solución**:
- Revisa que no haya errores en el código
- Optimiza queries a Supabase si son lentos
- El webhook mejorado ya maneja errores correctamente

---

## Checklist de producción

Antes de lanzar a producción, verifica:

- [ ] `STRIPE_WEBHOOK_SECRET` configurado en Vercel
- [ ] Webhook creado en Stripe Dashboard (producción)
- [ ] Eventos seleccionados: `checkout.session.completed`, `payment_intent.payment_failed`, `payment_intent.succeeded`
- [ ] URL del webhook apunta a tu dominio real
- [ ] Hiciste un pago de prueba y verificaste logs
- [ ] Verificaste que se creó registro en `donations`
- [ ] Verificaste que se actualizó `current_amount` en `campaigns`

---

## 🎯 Mejoras futuras

- [ ] Sistema de reintentos automáticos
- [ ] Notificaciones por email en fallos
- [ ] Dashboard de monitoreo de webhooks
- [ ] Registro de eventos en base de datos
- [ ] Alertas en Slack/Discord para pagos

---

**¿Preguntas?** Revisa los logs, son tu mejor amigo 🚀
