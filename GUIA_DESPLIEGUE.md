# 🐾 Guía de despliegue — Patitas Felices
## Paso a paso sin conocimientos técnicos

---

## PASO 1 — Crear cuenta en GitHub (gratis)
1. Ve a **github.com** y crea una cuenta gratuita
2. Pulsa el botón verde **"New repository"**
3. Ponle de nombre: `patitas-felices`
4. Marca **"Public"** y pulsa **"Create repository"**
5. Sube todos los archivos del proyecto arrastrándolos a la pantalla

---

## PASO 2 — Crear base de datos en Supabase (gratis)
1. Ve a **supabase.com** y crea una cuenta gratuita
2. Pulsa **"New project"**, elige un nombre (ej: `patitas-felices`) y una contraseña
3. Espera ~2 minutos a que arranque el proyecto
4. Ve al menú lateral → **SQL Editor** → **New query**
5. Copia y pega todo el contenido del archivo `supabase_schema.sql`
6. Pulsa **"Run"** — se crearán todas las tablas, permisos y datos de ejemplo

### Obtener las credenciales de Supabase
1. En el menú lateral ve a **Settings → API**
2. Copia:
   - **Project URL** → es tu `VITE_SUPABASE_URL`
   - **anon public** key → es tu `VITE_SUPABASE_ANON_KEY`

---

## PASO 3 — Activar login con Google (opcional pero recomendado)
1. En Supabase ve a **Authentication → Providers → Google**
2. Actívalo y sigue las instrucciones para obtener las credenciales de Google Cloud
3. Si prefieres solo email, no hace falta hacer nada

---

## PASO 4 — Desplegar la web en Vercel (gratis)
1. Ve a **vercel.com** y crea una cuenta (puedes entrar con GitHub)
2. Pulsa **"Add New Project"**
3. Selecciona tu repositorio `patitas-felices`
4. En la sección **"Environment Variables"** añade estas dos variables:
   ```
   VITE_SUPABASE_URL       = (la URL que copiaste de Supabase)
   VITE_SUPABASE_ANON_KEY  = (la clave anon que copiaste)
   ```
5. Pulsa **"Deploy"** — en ~2 minutos tendrás tu web en vivo con una URL como:
   `https://patitas-felices.vercel.app`

---

## PASO 5 — Hacer admin a tu usuario
1. Regístrate en tu web con tu email
2. En Supabase ve a **Authentication → Users**
3. Haz clic en tu usuario → **Edit**
4. En **"User metadata"** añade:
   ```json
   { "rol": "admin" }
   ```
5. Guarda — ya puedes acceder a `/admin` desde el menú

---

## PASO 6 — Configurar notificaciones por email (gratis)
Para que te lleguen emails cuando alguien da un like, solicita una cita o envía una adopción:

1. Ve a **resend.com** y crea una cuenta gratuita (100 emails/día gratis)
2. Obtén tu API key
3. En Supabase ve a **Edge Functions** → **"New Function"**
4. Crea una función llamada `notificar-admin` con este código:

```typescript
import { serve } from 'https://deno.land/std/http/server.ts'

serve(async (req) => {
  const { tipo, datos } = await req.json()

  const asunto = tipo === 'cita'
    ? `📅 Nueva cita: ${datos.nombre} quiere visitar ${datos.animal}`
    : tipo === 'like'
    ? `❤️ Nuevo like en ${datos.animal}`
    : `🐾 Nueva solicitud de adopción: ${datos.animal}`

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Patitas Felices <hola@tudominio.com>',
      to: Deno.env.get('ADMIN_EMAIL'),
      subject: asunto,
      html: `<p>${JSON.stringify(datos)}</p>`,
    }),
  })

  return new Response('ok')
})
```

5. En **Settings → Edge Functions** añade los secrets:
   - `RESEND_API_KEY` = tu clave de Resend
   - `ADMIN_EMAIL` = tu email de contacto

---

## PASO 7 — Notificaciones por WhatsApp
Para WhatsApp Business API necesitas una cuenta en **Twilio** o **360dialog**.
Twilio ofrece crédito gratuito de inicio (~15€).

1. Crea cuenta en **twilio.com**
2. Activa el sandbox de WhatsApp
3. Añade la lógica en la Edge Function de arriba usando el endpoint de Twilio

---

## Estructura de archivos del proyecto
```
patitas-felices/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx          ← Barra de navegación
│   │   ├── AuthModal.jsx       ← Login / Registro
│   │   ├── AnimalCard.jsx      ← Tarjeta de animal en galería
│   │   ├── CitaCalendar.jsx    ← Calendario de visitas
│   │   └── ChatBox.jsx         ← Chat público y privado
│   ├── pages/
│   │   ├── Home.jsx            ← Galería pública con filtros
│   │   ├── AnimalPage.jsx      ← Ficha del animal
│   │   └── AdminPage.jsx       ← Panel de administración
│   ├── hooks/
│   │   └── useAuth.jsx         ← Hook de autenticación
│   ├── lib/
│   │   └── supabase.js         ← Cliente y funciones de base de datos
│   ├── App.jsx                 ← Rutas de la aplicación
│   ├── main.jsx                ← Entrada de React
│   └── index.css               ← Estilos globales
├── supabase_schema.sql         ← Base de datos completa (ejecutar en Supabase)
├── .env.example                ← Plantilla de variables de entorno
├── index.html
├── package.json
└── vite.config.js
```

---

## Resumen de costes
| Servicio | Plan | Coste |
|----------|------|-------|
| Supabase | Free | 0€/mes (500MB DB, 1GB storage, 2GB transferencia) |
| Vercel | Hobby | 0€/mes (100GB transferencia) |
| Resend | Free | 0€/mes (100 emails/día) |
| Dominio propio | Opcional | ~10€/año |

---

## Soporte
Si tienes algún problema con el despliegue, los pasos más habituales son:
1. Asegúrate de que las variables de entorno en Vercel son exactamente las mismas que en Supabase
2. Comprueba que ejecutaste el SQL completo sin errores
3. Confirma que tu usuario tiene `rol: admin` en los metadatos de Supabase
