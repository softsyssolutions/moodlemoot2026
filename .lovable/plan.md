
## Situación

La captura que compartes es del sitio **`moodlecolombia.com/panel/invitados`**, un **proyecto distinto** al que estamos editando ahora (este es **`moodlemootperu.com`**).

En este proyecto:

- **No existe** la ruta `/panel/invitados` ni un módulo "Invitados" con importador de CSV/Excel.
- Lo más parecido es **`/panel/asistentes`** (`src/pages/admin/Attendees.tsx`), que sí tiene un botón "Importar" y usa la edge function `admin-import-attendees`.
- No tengo acceso al código del proyecto de MoodleMoot Colombia desde aquí, así que **no puedo tocar directamente** la edge function que está devolviendo `non-2xx status code` en esa captura.

El error "Edge Function returned a non-2xx status code" con un archivo de **7.372 filas** es casi siempre una de estas 3 causas (aplica a ambos proyectos):

1. **Timeout / payload demasiado grande**: mandar 7.372 filas en un solo POST supera el límite de ~10 s y ~6 MB de las edge functions. Hay que **partir en lotes** (p.ej. 500 filas por request) desde el frontend.
2. **Validación estricta**: en `admin-import-attendees` los campos como `whatsapp` exigen mínimo 4 caracteres, `email` válido, `institution_type` en un enum, etc. Basta con que muchas filas fallen para que Zod rechace todo.
3. **Falta de permisos**: la función exige `is_staff_or_above`; si el usuario no tiene rol staff/admin devuelve 403.

## Qué necesito de ti para avanzar

Elige una opción (respóndeme con el número):

1. **Este proyecto (MoodleMoot Perú)**: adaptar/arreglar el importador de **Asistentes** aquí para que soporte archivos grandes (batching de 500 filas, reporte de errores por fila, tolerancia a WhatsApp vacío, etc.). Lo puedo implementar cuando confirmes.
2. **El otro proyecto (MoodleMoot Colombia)**: necesito que abras ese proyecto en Lovable y me lo indiques; desde aquí no puedo modificar su código ni sus edge functions.
3. **Solo diagnóstico**: dime en qué proyecto quieres trabajar y súbeme el `.xlsx` (o una muestra de 20 filas) para reproducir el error exacto y luego decidir.

## Detalles técnicos (para cuando decidamos arreglar el importador aquí)

- Cambiar `AttendeeImportDialog` para trocear las filas en lotes de 500 y llamar la edge function N veces mostrando progreso.
- Ajustar `admin-import-attendees/index.ts`:
  - Subir el tope de `rows` (hoy `.max(1000)`) o dejar 500 y hacer el batching desde el cliente.
  - Hacer opcionales/normalizar `whatsapp`, `role_title`, `institution` cuando vengan vacíos (hoy `min(4)` en whatsapp rechaza filas legítimas).
  - Devolver `{ created, updated, errors[] }` acumulado para que el frontend muestre las filas rechazadas.
- Verificar el rol del usuario que importa (`is_staff_or_above`) antes de enviar.

Confírmame la opción y, si puedes, adjunta el `.xlsx` que estás intentando subir.
