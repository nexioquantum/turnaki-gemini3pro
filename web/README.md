## Nexioq · Sistema de gestión de citas odontológicas

Aplicación Next.js (App Router + TypeScript + Tailwind) conectada a Supabase para cubrir el MVP definido en `../docs/sistema-citas-odontologicas.md`.

### Requisitos

- Node.js ≥ 18
- Supabase CLI (opcional, para aplicar migraciones localmente)
- Cuenta Supabase (para obtener claves y ejecutar las políticas)

### Configuración rápida

1. **Variables de entorno**

   ```bash
   cp .env.local.example .env.local
   ```

   Completa:

   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (solo para scripts/CLI)

2. **Dependencias**

   ```bash
   npm install
   ```

3. **Migraciones / Esquema**

   - Archivos SQL: `../supabase/migrations/0001_initial_schema.sql`
   - Ejecuta el contenido en tu proyecto Supabase (CLI o dashboard SQL editor).
   - Verifica que existan las tablas `profiles`, `patients`, `sillones`, etc., y las políticas de RLS.

4. **Usuarios iniciales (Supabase Auth)**

   | Rol    | Nombre             | Email sugerido            |
   | ------ | ------------------ | ------------------------- |
   | ADMIN  | Calixto Saldarriaga| (define correo real)      |
   | ODONTÓLOGO | Kelvin Delgado |                           |
   | ODONTÓLOGO | Josue XX       |                           |
   | ASISTENTE  | Asistente 1    |                           |

   > Asigna los roles en la tabla `profiles` inmediatamente después de crear cada usuario.

### Scripts útiles

| Comando        | Descripción                         |
| -------------- | ----------------------------------- |
| `npm run dev`  | Inicia el servidor local en `3000`. |
| `npm run build`| Compila la app para producción.     |
| `npm run start`| Sirve la build generada.            |
| `npm run lint` | Ejecuta ESLint.                     |

### Estructura destacada

- `src/lib/supabase/*`: clientes browser/server tipados + definición de la base de datos.
- `src/app/page.tsx`: dashboard inicial con checklist y verificación de conexión.
- `../supabase/migrations`: SQL mantenido en control de versiones.

### Flujo recomendado (según documento funcional)

1. Preparar Supabase (esquema, datos iniciales, reglas).
2. Implementar Iteración 1 (autenticación + gestión de perfiles/pacientes).
3. Continuar con las iteraciones descritas en la sección 8 del documento funcional.

Para dudas adicionales, revisa `../docs/sistema-citas-odontologicas.md`. Allí se detallan alcance, reglas de negocio, métricas, pruebas y plan de despliegue.
