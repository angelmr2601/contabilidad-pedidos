This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Integración Hostinger Mail

La ruta `/correo` añade el apartado de gestión de correo. La aplicación mantiene el flujo seguro `navegador → servidor de la aplicación → Hostinger Mail`; el token nunca se expone al cliente.

### Variables de entorno

Copia `.env.example` y configura en el entorno del servidor:

```env
HOSTINGER_MAIL_API_BASE_URL=https://api.mail.hostinger.com
HOSTINGER_MAIL_API_TOKEN=
HOSTINGER_MAIL_WEBHOOK_SECRET=
```

También conserva las variables existentes de Supabase y Basic Auth.

### Token y permisos

En hPanel ve a Emails → tu dominio → Agentic mail → API → Create API token. Selecciona acceso a buzones concretos cuando sea posible. Según la documentación pública de Agentic Mail, los permisos cubren acciones SMTP/IMAP y gestión de webhooks.

### Webhook

Crea un webhook en Agentic mail → Webhooks con la URL pública HTTPS de la aplicación desplegada en Vercel:

```text
https://TU_PROYECTO.vercel.app/api/webhooks/hostinger-mail
```

Si el dominio principal (`offsideclub.shop`, por ejemplo) apunta a Shopify, **no uses ese dominio para el webhook**, porque la petición llegará a Shopify y responderá 404 antes de tocar esta app. Usa una de estas opciones:

1. La URL `*.vercel.app` del deployment de Vercel. En este proyecto, la URL indicada es:

   ```text
   https://contabilidad-pedidos.vercel.app/api/webhooks/hostinger-mail
   ```

2. Un subdominio dedicado, por ejemplo `app.offsideclub.shop`, configurado como dominio del proyecto en Vercel.

Configura el evento `message.received` y guarda el secreto generado en `HOSTINGER_MAIL_WEBHOOK_SECRET`. El endpoint valida `Authorization: Bearer <secreto>` y rechaza eventos no documentados. La ruta `/api/webhooks/hostinger-mail` queda excluida de Basic Auth porque Hostinger solo envía su Bearer token; el resto de la app conserva la protección existente.

Cuando llega el webhook, la app guarda metadatos mínimos del mensaje en `hostinger_mail_message_statuses` y `/correo` muestra esos registros aunque el cuerpo completo siga consultándose en Hostinger hasta conectar endpoints REST oficiales. Si el correo llega al buzón pero no aparece en la app, revisa: URL pública HTTPS exacta de Vercel, webhook activo en hPanel, evento `message.received`, secreto en `HOSTINGER_MAIL_WEBHOOK_SECRET`, migraciones de Supabase aplicadas y logs del endpoint. Puedes abrir `https://contabilidad-pedidos.vercel.app/api/webhooks/hostinger-mail`, `https://TU_PROYECTO.vercel.app/api/webhooks/hostinger-mail` o `https://app.offsideclub.shop/api/webhooks/hostinger-mail` en el navegador para comprobar que Vercel tiene configurado el secreto; debe devolver `webhookSecretConfigured: true` sin exponer el valor.

### Estado de endpoints REST

Se verificó documentación pública de Hostinger Agentic Mail sobre autenticación Bearer, JSON, webhooks y el evento `message.received`. La página `https://api.mail.hostinger.com/` no expuso desde este entorno un esquema OpenAPI ni rutas concretas verificables para listado, detalle, envío o acciones; por seguridad, esas llamadas quedan centralizadas pero no activadas con rutas inventadas. Antes de producción hay que conectar los métodos de `lib/hostinger-mail/client.ts` a los paths oficiales publicados por Hostinger.

### Pruebas

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Las pruebas usan `fetch` simulado y no contactan buzones reales ni envían correos.
