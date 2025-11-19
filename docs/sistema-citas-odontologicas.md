## Sistema de gestión de citas odontológicas

### 1. Visión general

- **Objetivo**: Gestionar la agenda de un consultorio odontológico, inicialmente configurado con 2 odontólogos y 2 sillones de atención, evitando citas superpuestas y facilitando el control de pacientes y estados de las citas, con capacidad de configurar en el futuro el número de odontólogos y sillones.
- **Dolores actuales del odontólogo**:
  - Citas superpuestas por falta de control centralizado.
  - Falta de visibilidad clara del día y de la semana de trabajo.
  - Dificultad para ver en retrospectiva las citas realizadas y no realizadas.
  - Olvido frecuente de marcar que un paciente no asistió.
  - Falta de un historial rápido de citas por paciente.
- **Beneficio esperado / visión ideal**:
  - El odontólogo puede decir: “veo mi día de un vistazo y agendo sin preocupaciones de solapamiento”.
  - El odontólogo cuenta con una agenda que le permite revisar rápidamente qué pasó (o no pasó) con cada paciente.
- **Configuración flexible**:
  - El administrador puede asociar a cada odontólogo con uno o varios sillones, según cómo opere el consultorio.
  - Toda cita requiere obligatoriamente un odontólogo activo y un sillón disponible; sin ambos elementos la atención no puede llevarse a cabo.
  - Las citas pueden iniciarse anclándose a un odontólogo o a un sillón (por disponibilidad), pero antes de confirmarse siempre deben dejar registrada la pareja odontólogo–sillón.
  - Si la configuración define reservas “por odontólogo”, la selección del odontólogo determina automáticamente el sillón (o el orden de prioridad de sus sillones disponibles) para ese horario.
  - En las solicitudes de pacientes, la interfaz solo les permite elegir fecha y odontólogo; el sistema calcula y reserva el sillón adecuado.
  - El sistema ofrece parametrización detallada y granular para ajustar horarios, duración de citas, reglas de asignación, estados y otros comportamientos sin necesidad de cambios de código.
- **Descripción general**: El sistema permite:
  - A los odontólogos: administrar pacientes, crear y gestionar citas, aprobar solicitudes y cambiar estados.
  - A los pacientes: solicitar turnos en huecos disponibles, sujetos a aprobación del odontólogo.

### 2. Usuarios y contexto

- **Administrador**
  - Rol con permisos especiales para parametrizar el sistema (sillones, horarios, reglas, roles, etc.).
  - Puede crear y administrar usuarios (odontólogos, asistentes) y ajustar la configuración avanzada.

- **Odontólogo**
  - Usa el sistema desde computador, tablet o móvil.
  - Inicia sesión para gestionar su agenda y pacientes.
  - Su disponibilidad depende tanto de su calendario como de los sillones que el administrador le haya asignado.
  - Mientras no exista asistente dedicado, también confirma/rechaza las citas solicitadas por pacientes.

- **Asistente** *(rol futuro, aún no operativo en el MVP)*
  - Tendrá permisos para crear, confirmar o mover citas en nombre del consultorio.
  - Su activación dependerá de cuándo se incorpore personal de apoyo.

- **Paciente**
  - Accede a una página pública/simple para solicitar citas desde cualquier dispositivo.
  - Puede registrar sus datos para reutilizarlos o completar un formulario rápido cada vez; el odontólogo también puede crear pacientes sobre la marcha durante un agendamiento.
  - Solo ve disponibilidad (huecos libres), nunca datos de otros pacientes.
  - Selecciona fecha y odontólogo; el sillón se asigna automáticamente según la configuración definida.
  - Su solicitud queda pendiente de aprobación por el odontólogo (o asistente cuando exista).

### 3. Alcance del MVP

- **Incluido**
  - Crear odontólogo/usuario.
  - Crear paciente.
  - Crear cita por parte del odontólogo (cita autoconfirmada).
  - Crear cita/solicitud por parte del paciente (queda pendiente).
  - Confirmar cita por el odontólogo.
  - Cambiar estado de cita a:
    - `ATENDIDA`
    - `NO_ASISTIO`
  - Vista de calendario para el odontólogo (día/semana).
  - Reprogramación de citas (ajuste de fecha/hora manteniendo historial).
  - Notas rápidas asociadas a cada cita (ej. motivo, observaciones).
  - Registro del pago recibido al finalizar la consulta (monto y medio).
  - Reportes básicos de citas y producción por odontólogo:
    - Cantidad de citas por estado.
    - Tiempo total atendido.
    - Valor económico generado (según configuraciones de honorarios).
    - El odontólogo ve solo su producción o la de todos según permisos; el administrador ve toda la operación.

- **Fuera de alcance inicial**
  - Recordatorios por correo/SMS.
  - Historia clínica detallada.
  - Pagos en línea o integraciones con pasarelas (solo se registra el pago recibido manualmente).
  - Operar múltiples consultorios independientes (multi-sede) más allá de la configuración flexible actual.
  - Reportes avanzados (estadísticas cruzadas, dashboards complejos).

### 4. Reglas de negocio

- **Regla de capacidad por sillón**
  - En un mismo rango `fecha_hora_inicio`–`fecha_hora_fin` no puede haber más citas con estado `PENDIENTE` o `CONFIRMADA` que el número de sillones configurados (valor inicial: 2).
- **Modo de asignación configurable**
  - El consultorio define si la agenda se controla por odontólogo, por sillón o por ambos.
  - Si es por odontólogo, cada profesional tiene su cupo limitado por los sillones que le estén asociados.
  - Si es por sillón, cada sillón admite solo una cita activa a la vez y el odontólogo puede asignarse en el momento de la reserva o después, según la configuración.
  - En solicitudes iniciadas por pacientes, la interfaz siempre toma al odontólogo como punto de partida y asigna automáticamente el sillón disponible siguiendo las prioridades definidas.
- **Disponibilidad del odontólogo**
  - Un odontólogo solo puede tener una cita activa (pendiente o confirmada) por franja horaria; no se permiten solapamientos para el mismo odontólogo aunque existan sillones libres.
- **Pareja obligatoria odontólogo–sillón**
  - Para que una cita quede confirmada y pueda ejecutarse, debe existir siempre un odontólogo activo y un sillón asignado.
  - Si el flujo inicia solo con odontólogo o solo con sillón, la aplicación deberá completar el elemento faltante antes de permitir la confirmación.

- **Estados de la cita**
  - `PENDIENTE`: creada por paciente, aún no aprobada por el odontólogo (puede faltar la asignación definitiva de sillón u odontólogo, pero no se puede confirmar sin ambos).
  - `CONFIRMADA`: aprobada por el odontólogo o creada directamente por él.
  - `ATENDIDA`: paciente asistió y fue atendido.
  - `NO_ASISTIO`: paciente no se presentó a la cita.
  - `CANCELADA`: anulada por paciente, odontólogo o administrador; libera la capacidad del sillón y del odontólogo.

- **Origen de la cita**
  - `ODONTOLOGO`: cita creada directamente por el odontólogo (autoconfirmada).
  - `PACIENTE`: cita/solicitud creada por el paciente (queda `PENDIENTE`).
  - `ASISTENTE`: cuando exista este rol, podrá crear/gestionar citas en nombre del consultorio.

### 5. Modelo de datos (alto nivel)

**Usuarios / Odontólogos (Supabase Auth + profiles)**
- El registro maestro vive en `supabase.auth.users` (email, password, metadata).
- Tabla complementaria `profiles` (1:1 con `auth.users`) almacena la información de negocio:
  - `id` (mismo UUID que `auth.users`)
  - `nombre`, `apellido`
  - `rol` (`ADMIN`, `ODONTOLOGO`, `ASISTENTE` futuro)
  - `activo` (booleano)
  - `preferencias` (JSON para vista de calendario, duración por defecto, etc.)
  - `created_at`, `updated_at`
- Las reglas de acceso (RLS) se apoyan en `rol` para controlar permisos sobre citas, pacientes y reportes.

**Pacientes**
- `id`
- `nombres`, `apellidos`
- `ci` (número de cédula, único y validado cuando se provee)
- `fecha_nacimiento`
- `direccion`
- `telefono`
- `email`
- `contacto_emergencia_nombre`
- `contacto_emergencia_telefono`
- `alergias` (texto)
- `observaciones` (texto libre)
- `created_by` (odontólogo o administrador que lo registró)
- `created_at`, `updated_at`

**Sillones**
- `id`
- `nombre` o `codigo`
- `ubicacion` (ej. sala/consultorio)
- `activo` (booleano)
- `orden_prioridad` (numérico para asignación automática)
- `notas` (opcional)

**Disponibilidad y bloques horarios**
- Los bloques se parametrizan según el modo elegido:
  - **Por odontólogo**: tabla `odontologo_bloques` con `odontologo_id`, `dia_semana`, `hora_inicio`, `hora_fin`.
  - **Por sillón**: tabla `sillon_bloques` con `sillon_id`, `dia_semana`, `hora_inicio`, `hora_fin`.
  - Ambos modelos pueden convivir; el algoritmo cruza disponibilidad odontólogo–sillón.

**Asociación Odontólogo–Sillón**
- Se adopta la **tabla simple de asociación** `odontologo_sillon` como modelo oficial:
  - `id`
  - `odontologo_id`
  - `sillon_id`
  - `prioridad` (define el orden al elegir sillón automáticamente en reservas “por odontólogo”)
  - `vigencia_desde`, `vigencia_hasta` (opcional, para cambios programados)
  - `activo`
- Ventajas de esta opción:
  - Configuración clara y rápida (ideal para un consultorio pequeño/mediano).
  - Soporta asociaciones múltiples (un odontólogo → varios sillones y viceversa).
  - Permite determinar automáticamente el sillón cuando el paciente reserva por odontólogo (según prioridad y disponibilidad).
- Consideraciones descartadas:
  - Bloques específicos por pareja (`odontologo + sillon`) → se reserva para futuras necesidades más complejas.
  - Configuración solo por sillón → no permitiría preferencias de odontólogos con múltiples sillones.

**Citas**
- `id`
- `odontologo_id` (FK; requerido al confirmar)
- `paciente_id` (FK)
- `sillon_id` (FK; requerido al confirmar)
- `fecha_hora_inicio`
- `fecha_hora_fin`
- `duracion_minutos` (derivado o editable para estadísticas)
- `estado` (`PENDIENTE`, `CONFIRMADA`, `ATENDIDA`, `NO_ASISTIO`, `CANCELADA`)
- `origen` (`ODONTOLOGO`, `PACIENTE`, `ASISTENTE`)
- `motivo_id` (FK a catálogo configurable de motivos/notas rápidas)
- `motivo_detalle` (texto libre complementario)
- `honorario_estimado` (valor esperado antes de la consulta)
- `honorario_final` (valor cobrado real)
- `estado_pago` (`PENDIENTE`, `PARCIAL`, `PAGADO`)
- `metodo_pago_preferido` (opcional, para orientación)
- `reprogramada_desde_id` (FK a otra cita si viene de reprogramación)
- `ultima_reprogramacion_at`
- `cancelada_por_id`, `cancelada_at`, `motivo_cancelacion`
- `created_by`, `updated_by`, timestamps

**Pagos**
- Tabla `pagos` para soportar múltiples pagos por cita:
  - `id`
  - `cita_id`
  - `monto`
  - `moneda`
  - `metodo_pago` (efectivo, tarjeta, transferencia, etc.)
  - `fecha_pago`
  - `registrado_por_id`
  - `notas`
- Permite registrar pagos parciales y consolidar información financiera.

**Notas y motivos**
- Catálogo `motivos_cita` (configurable por el administrador) con campos `id`, `nombre`, `descripcion`, `orden`, `activo`.
- Tabla `cita_notas` cuando se necesiten múltiples notas por cita:
  - `id`
  - `cita_id`
  - `motivo_id` (opcional, si se usa catálogo)
  - `texto_adicional`
  - `registrado_por_id`
  - `timestamp`

**Historial de reprogramaciones y eventos**
- Tabla `cita_eventos` para auditar cambios:
  - `id`
  - `cita_id`
  - `tipo_evento` (`CREACION`, `REPROGRAMACION`, `CANCELACION`, `PAGO`, etc.)
  - `descripcion`
  - `datos_previos` / `datos_nuevos` (JSON para difs)
  - `ejecutado_por_id`
  - `timestamp`
- Permite rastrear quién reprogramó o canceló y cuándo ocurrió.

### 6. Flujos funcionales principales

- **Flujo 1: Crear odontólogo/usuario**
  - Un administrador (rol `ADMIN`) crea la cuenta en Supabase Auth (email y rol).
  - Se completa el registro correspondiente en `profiles` con datos del odontólogo y sillones asignados.
  - El sistema envía invitación/contraseña inicial; el odontólogo acepta y puede iniciar sesión.

- **Flujo 2: Crear paciente**
  - El odontólogo abre el formulario “Nuevo paciente”.
  - Completa datos básicos.
  - Guarda y el paciente queda disponible para futuras citas.

- **Flujo 3: Crear cita (odontólogo, autoconfirmada)**
  - Odontólogo inicia sesión.
  - Selecciona un paciente existente.
  - Selecciona fecha y hora de inicio/fin.
  - Indica explícitamente odontólogo y sillón (el odontólogo puede ser él mismo si la agenda es personal); el sistema valida que la pareja esté permitida según la configuración.
  - El sistema verifica que la cantidad de citas `PENDIENTE` o `CONFIRMADA` en ese rango no supere la capacidad disponible (por sillón o por odontólogo-sillón).
  - Si es válido, crea la cita con estado `CONFIRMADA` y origen `ODONTOLOGO`.

- **Flujo 4: Crear cita (solicitud del paciente)**
  - Paciente accede a la página de solicitud.
  - Selecciona fecha y el odontólogo con quien desea atenderse (si el consultorio lo permite, también puede dejar la selección automática).
  - El sistema ubica los huecos libres según la duración estándar y, una vez elegido odontólogo, determina automáticamente el sillón disponible en ese horario siguiendo la prioridad configurada.
  - El paciente rellena sus datos (registro rápido u opcional reutilizando datos previos).
  - El sistema crea una cita en estado `PENDIENTE`, con origen `PACIENTE`, odontólogo asignado y sillón reservado automáticamente.

- **Flujo 5: Confirmar cita (odontólogo)**
  - Odontólogo ve listado o calendario con citas `PENDIENTE`.
  - Selecciona una cita y la aprueba.
  - El estado pasa a `CONFIRMADA`.

- **Flujo 6: Marcar como atendida o no asistió**
  - Desde la vista de agenda del día, el odontólogo selecciona una cita.
  - Puede marcar `ATENDIDA` o `NO_ASISTIO`.

### 7. Stack técnico propuesto (borrador)

- **Frontend + backend ligero**
  - Next.js + React + TypeScript.
  - Uso de API Routes para implementar la lógica de backend necesaria.

- **Base de datos y autenticación**
  - Supabase (PostgreSQL + Auth) como backend unificado:
    - `supabase.auth` gestiona credenciales, recuperación de contraseña y verificación de correo.
    - Tabla `profiles` (1:1 con `auth.users`) almacena rol (`ADMIN`, `ODONTOLOGO`, `ASISTENTE`) y metadatos descritos en el modelo.
    - Tablas relacionales (`patients`, `appointments`, `sillones`, `pagos`, etc.) viven en Postgres.
    - Row Level Security + policies basadas en el rol para garantizar que cada odontólogo vea solo su información, mientras el administrador tiene control total.

- **Despliegue**
  - Vercel para la app web (free tier).
  - Supabase gestionado (free tier) como base de datos y auth.
- **CI/CD**
  - GitHub + GitHub Actions para ejecutar lint, pruebas y construir la aplicación en cada PR.
  - Integración con Vercel para despliegues automáticos (preview y producción).
  - Automatización de migraciones/esquemas en Supabase como parte del pipeline cuando aplique.
  - Suite de pruebas automatizadas:
    - Unitarias y de integración (Jest/Testing Library).
    - End-to-end con Playwright (ejecutadas en cada PR y antes de desplegar).

### 8. Plan de desarrollo (iteraciones)

- **Iteración 0 – Setup y pipeline inicial**
  - Crear repositorio.
  - Crear proyecto base (por ejemplo, Next.js + TypeScript).
  - Configurar conexión con la base de datos (Supabase u otra).
  - Configurar Vercel (entorno preview y producción) y variables de entorno.
  - Configurar pipeline inicial (GitHub Actions) para lint, pruebas básicas y build en cada push/PR.

- **Iteración 1 – Modelo de datos y autenticación**
  - Crear el esquema inicial en Supabase: `profiles`, `patients`, `sillones`, `appointments` (estructura mínima).
  - Configurar Supabase Auth + Next.js (login/logout, persistencia de sesión, lectura de `rol`).
  - Sembrar usuario administrador y los dos odontólogos iniciales (roles correctos en `profiles`).
  - Probar creación y lectura básica asegurando que las policies respeten los roles.

- **Iteración 2 – Gestión de pacientes**
  - Pantalla para listar pacientes.
  - Formulario de alta/edición.
  - Validaciones básicas.

- **Iteración 3 – Gestión de citas (odontólogo)**
  - Formulario para crear citas confirmadas.
  - Validación de solapamiento según el modo configurado (capacidad por sillón u odontólogo).
  - Listado de citas del día.

- **Iteración 4 – Vista de calendario**
  - Integrar un componente de calendario (día/semana).
  - Mostrar citas con colores según estado.

- **Iteración 5 – Solicitud de cita por paciente**
  - Página pública para seleccionar huecos libres.
  - Formulario de datos del paciente (opción de reutilizar información previa).
  - Selección de odontólogo; la aplicación determina automáticamente el sillón disponible y crea la cita en estado `PENDIENTE`.

- **Iteración 6 – Aprobación y estados finales**
  - Pantalla/listado de citas pendientes.
  - Acción para confirmar.
  - Acciones para marcar `ATENDIDA` o `NO_ASISTIO`.

- **Iteración 7 – Reprogramación y notas**
  - Permitir mover/reprogramar citas manteniendo historial de cambios.
  - Registrar notas rápidas (motivo, observaciones) visibles según rol.
  - Controlar que la nueva franja respete reglas de disponibilidad y capacidad.

- **Iteración 8 – Pagos y cierre diario**
  - Campos para registrar monto y medio de pago al finalizar la consulta.
  - Validar que solo citas `ATENDIDA` puedan registrar pago.
  - Vista de cierre diario: total de citas atendidas, pagos recibidos.

- **Iteración 9 – Reportes de producción**
  - Reporte por odontólogo (cantidad de citas por estado, tiempo acumulado, valor económico).
  - Filtros por rango de fechas, estado y odontólogo.
  - Control de permisos: cada odontólogo ve su producción (o la de todos si tiene permiso); el administrador ve todo.

- **Iteración 10 – Pruebas y CI/CD final**
  - Pruebas manuales y automatizadas de regresión sobre todos los flujos.
  - Ampliar pipeline CI para ejecutar suites completas (unitarias, integración y e2e) y bloquear merges con fallos.
  - Automatizar despliegues a producción tras aprobaciones (Vercel) y coordinar migraciones Supabase.
  - Checklist final con el consultorio y preparación para operación.

### 9. Estrategia de pruebas

- **Tipos de pruebas**
  - *Unitarias* (Jest/Testing Library): componentes UI, hooks y helpers de lógica.
  - *Integración* (API Routes, servicios Supabase): validar reglas de negocio (disponibilidad, bloqueos, pagos).
  - *End-to-end* (Playwright): flujos críticos completos en un entorno cercano a producción.
  - *Pruebas manuales de aceptación*: walkthrough con usuarios reales antes de cada despliegue mayor.

- **Cobertura mínima e2e (obligatoria)**
  1. Creación de usuario/odontólogo por administrador (incluida invitación e inicio de sesión).
  2. Creación/edición de paciente.
  3. Creación de cita por odontólogo (autoconfirmada).
  4. Solicitud de cita por paciente (selección de odontólogo, sillón automático).
  5. Confirmación de cita pendiente.
  6. Cancelación de cita (desde odontólogo/paciente) con verificación de liberación de capacidad.
  7. Reprogramación: mover cita a otro horario respetando reglas de sillón/odontólogo.
  8. Registro de pago y cierre diario (resumen de citas atendidas y montos).

- **Datos semilla**
  - Las suites e2e generan datos dinámicamente (usuarios/pacientes/citas) y los eliminan o aíslan por ambiente para evitar dependencia de fixtures estáticos.
  - Para pruebas de aceptación, se dispondrá de un ambiente “staging” con datos ficticios que representen la operación de KMDT Dental Studio.

- **Ambientes**
  - *Local dev*: usa Supabase local o proyecto aislado para debugging rápido.
  - *Staging / Preview (Vercel)*: ejecuta e2e automáticas en PRs importantes; datos con prefijos para diferenciarse del entorno de producción.
  - *Producción*: se ejecutan smoke tests automáticos (sanity) tras el despliegue y antes de abrir acceso a usuarios.

- **Responsabilidades**
  - *Pruebas manuales internas*: el desarrollador (tú) ejecuta checklists antes de cada release y documenta resultados.
  - *Pruebas de aceptación*: se coordinan con KMDT Dental Studio (al menos un odontólogo real) para validar nuevas funcionalidades.
  - *Supervisión de automatizadas*: el desarrollador monitorea GitHub Actions; fallos en e2e bloquean el merge hasta resolverse.

- **Datos sensibles**
  - En ambientes de pruebas no se usan datos reales de pacientes.
  - Los accesos de Supabase se rotan y se mantienen variables separadas por ambiente.

- **Reporte y seguimiento**
  - Cada ejecución de CI adjunta los resultados de e2e (videos, capturas).
  - Issues detectados por odontólogos en aceptación se registran en el backlog con prioridad alta antes de promover a producción.

### 10. Operación y monitoreo

- **Métricas clave (dashboard operativo)**
  - Citas confirmadas por día y por semana.
  - Porcentaje de no asistencia (`NO_ASISTIO`) vs. total de citas.
  - Tiempo ocioso de cada sillón (franjas libres dentro del horario disponible).
  - Ingresos diarios (sumatoria de pagos registrados).
  - Producción por odontólogo (citas atendidas, tiempo total y valor generado).

- **Backups y retención**
  - Respaldos automáticos diarios de la base de datos a medianoche (zona horaria consultorio).
  - Retención mínima de 90 días.
  - Revisión mensual para verificar restauración en ambiente de prueba.

- **Alertas automáticas (vía correo electrónico)**
  - Fallos en el pipeline CI/CD (builds, pruebas unitarias, integración o e2e).
  - Errores en producción (500s repetidos, fallos al crear/confirmar citas, problemas de pago).
  - Supresión anómala de citas o cambios masivos fuera de horario laboral.
  - Cualquier otra condición crítica detectada (por ejemplo, indisponibilidad de Supabase o Vercel).

- **Soporte operativo**
  - Primer punto de contacto: el desarrollador (tú mismo).
  - Canal para el consultorio (KMDT Dental Studio): correo dedicado `junior.cbss@gmail.com` para reportar incidencias o dudas.
  - Tiempo objetivo de respuesta inicial: < 4 horas hábiles.
  - Registro de incidencias en backlog o sistema de tickets para seguimiento.

- **Monitoreo básico**
  - Logs de Next.js y Vercel revisados tras cada deploy.
  - Supabase Monitoring para consumo de recursos y consultas lentas.
  - Alertas de cuota (supabase/vinculaciones) para evitar cortes de servicio.

### 11. Plan de datos iniciales y configuración

- **Usuarios iniciales (Supabase Auth + profiles)**
  - `ADMIN`: Calixto Saldarriaga (`junior.cbss@gmail.com`).
  - `ODONTOLOGO`: Kelvin Delgado.
  - `ODONTOLOGO`: Josue XX.
  - `ASISTENTE` (rol preparado aunque no opere en MVP): “Asistente 1”.
  - Cada usuario recibirá invitación por email y deberá cambiar su contraseña en el primer acceso.

- **Sillones**
  - `Sillón 1`: asignado a Kelvin Delgado, prioridad 1.
  - `Sillón 2`: asignado a Josue XX, prioridad 1.
  - Ambos se marcan como activos y disponibles desde el día de inicio.

- **Catálogos y configuraciones**
  - Motivos de cita (catálogo inicial):
    1. Consulta odontológica.
    2. Limpieza odontológica.
    3. Otros (texto libre para detalles).
  - Métodos de pago:
    1. Efectivo.
    2. Transferencia.
    3. Tarjeta de crédito.
    4. Otros.
  - No se definen honorarios fijos por tipo de cita; se registran caso a caso.

- **Horarios y bloqueos iniciales**
  - Horario general por odontólogo: lunes a viernes, 08:00 a 18:00.
  - Bloqueo diario de almuerzo/mantenimiento: 13:00 a 15:00 (no se muestran huecos a pacientes en esa franja).
  - Estos bloques se configuran en los módulos de disponibilidad correspondientes y se replican para ambos sillones/odontólogos.

- **Datos en ambiente de pruebas (staging)**
  - Se replica la misma configuración (usuarios, sillones, catálogos, horarios) en un proyecto de Supabase separado para que KMDT Dental Studio pruebe sin afectar producción.
  - Los datos creados durante pruebas se resetean semanalmente para evitar contaminación.

- **Checklist previo al go-live**
  1. Verificar que todos los usuarios iniciales hayan confirmado sus credenciales.
  2. Validar disponibilidad de los sillones y bloques en el calendario.
  3. Crear al menos un paciente ficticio para pruebas de aceptación internas.
  4. Ejecutar flujos e2e en staging con la configuración duplicada.
  5. Obtener sign-off de KMDT Dental Studio antes de habilitar producción.


