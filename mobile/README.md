# Offside Club Mobile

App nativa Android con React Native, Expo Router, TypeScript y Supabase Auth/Database. No usa Capacitor ni WebView.

## Instalación

```bash
cd mobile
npm install
```

## Variables de entorno

Copia `.env.example` a `.env` y rellena solo variables públicas:

```env
EXPO_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=TU_ANON_KEY_PUBLICA
```

No uses `service_role` ni claves privadas en la app móvil.

## Ejecutar en Expo

```bash
cd mobile
npx expo start
```

Puedes abrir el QR con Expo Go mientras las dependencias nativas sean compatibles con Expo Go.

## Emulador Android

```bash
cd mobile
npm run android
```

## Generar APK con EAS

Inicia sesión con EAS localmente y ejecuta:

```bash
cd mobile
npm run build:android:preview
```

El perfil `preview` genera APK instalable. `production` genera Android App Bundle.

## Supabase Auth

1. En Supabase Dashboard, abre **Authentication > Providers**.
2. Activa **Email** y, si quieres crear usuarios desde el dashboard, desactiva temporalmente confirmación de email o confirma el usuario manualmente.
3. Crea un usuario en **Authentication > Users > Add user** con email y contraseña.
4. Prueba el login en `/login` usando esas credenciales.
5. Si RLS está activo, crea políticas para que usuarios autenticados puedan leer y escribir las tablas `pedidos`, `productos` y `configuracion_precios` según tu modelo de permisos. Ejemplo inicial no multiusuario: políticas para rol `authenticated` en SELECT/INSERT/UPDATE/DELETE.

## Base de datos

La app usa las tablas existentes `pedidos`, `productos` y `configuracion_precios`. Espera columnas actuales de la web como `parche` y `manga_larga`. Si faltan, añade migraciones no destructivas en Supabase antes de usar la app.

## Funcionalidades listas

- Login/logout con Supabase Auth y sesión persistente con AsyncStorage.
- Listado, creación, edición y eliminación de pedidos.
- Alta, edición, eliminación y duplicado de productos.
- Marcado de pagado y entregado.
- Archivado/desarchivado automático cuando todos los productos están pagados y entregados.
- Resumen de ventas, costes, beneficio, pendiente de cobro y pendientes de entrega.
- Configuración de precios editable.
- Tipos Fan, Player, Retro, Personalizada e Infantil.
- Checks independientes de personalización, parche y manga larga.

## Limitaciones actuales

- No hay modo offline avanzado.
- No se implementa 17TRACK.
- No se implementa biometría todavía; el flujo de autenticación queda separado en `lib/auth.ts` para añadir desbloqueo local más adelante.
- La app móvil no debe llamar a 17TRACK directamente. La API key de 17TRACK debe quedarse en backend. En el futuro la app móvil llamará a rutas API seguras en Vercel o Supabase Edge Functions.

## Iconos

Los binarios no se incluyen en el repositorio para evitar errores al crear el pull request. Para builds reales coloca estos PNG en `assets/` y, si quieres usarlos como assets personalizados, reactiva sus referencias en `app.json`:

- `assets/icon.png`
- `assets/adaptive-icon.png`
- `assets/splash.png`

## Próximo paso recomendado

Definir políticas RLS definitivas por usuario/rol y probar un APK `preview` en un dispositivo Android real.

## Seguimiento de pedidos

El número de seguimiento queda preparado para la futura integración con 17TRACK.
La app móvil no debe llamar directamente a 17TRACK porque la API key debe permanecer en backend.
