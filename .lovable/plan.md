

## GestionRoom — Panel de Control SaaS

### Visión General
Back-office profesional para gestión de Escape Rooms con autenticación por clave de licencia vía URL, estructura de tres columnas, y diseño data-driven inspirado en dashboards como Stripe/Linear.

---

### 1. Diseño y Tema Visual
- Fondo off-white `#F8F9FA`, tarjetas blancas con sombras suaves
- Sidebar izquierdo con fondo Deep Navy `#0F172A`
- Acentos en azul corporativo `#2563EB`
- Tipografía Inter, bordes redondeados 6-10px
- Variables CSS personalizadas para todo el sistema de colores

### 2. Sistema de Acceso por Licencia (Supabase)
- **Tabla `profiles`** en Supabase con campos: `access_key`, `plan_status`, `subscription_end`, `business_name`, `owner_name`, `email`
- Al cargar, lee `?key=` de la URL y valida contra Supabase:
  - ¿Existe la key? → Si no, pantalla "Acceso Denegado"
  - ¿`plan_status` = 'active'? → Si no, tarjeta "Suscripción Expirada" con CTA a pricing
  - ¿`subscription_end` > hoy? → Si no, misma pantalla de expiración
- Pantalla de acceso denegado elegante con redirección a `https://gestionroom.com/precios`

### 3. Layout de Tres Columnas
- **Sidebar Izquierdo (fijo, ~250px):** Logo GestionRoom (candado con ojo) arriba, navegación central, perfil de usuario abajo
- **Área Central (fluida):** Barra superior + KPIs + Tabla principal
- **Sidebar Derecho (fijo, ~300px):** Integraciones + Feed de reservas del día

### 4. Sidebar Izquierdo — Navegación
- Ítems: Dashboard, Reservas, Salas, Game Masters, Ajustes
- Iconos Lucide para cada sección
- Estado activo resaltado con acento azul
- **Sección de perfil abajo:**
  - Nombre del negocio y propietario
  - Access Key con efecto `blur-md`, botón ojo para revelar, botón copiar
  - Botón "Gestionar Suscripción" / "Renovar"

### 5. Área Central — Dashboard
- **Barra superior:** Campo de búsqueda + avatar/menú de usuario
- **4 Tarjetas KPI** en grid:
  - Reservas Totales (Mes) — con icono y tendencia
  - Salas Activas — conteo
  - Clientes Nuevos — reservas de primera vez
  - Game Masters Disponibles
- **Tabla "Últimas Reservas":**
  - Columnas: Cliente, Sala, Fecha/Hora, Game Master, Estado
  - Filtros por estado: Confirmada (verde), Pendiente (amarillo), Cancelada (rojo)
  - Badges pill-shaped para estados
  - Hover sutil en filas, datos mock realistas de escape rooms

### 6. Sidebar Derecho
- **Integraciones Activas:** Icono de Stripe con badge "Conectado"
- **Próximas Reservas (Hoy):** Timeline vertical con hora, nombre de sala, Game Master asignado, datos mock

### 7. Datos Mock
Todo el dashboard usará datos mock realistas (salas como "La Cripta", "Laboratorio Zombie", game masters con nombres, reservas con horarios). La conexión real a Supabase solo se usará para la validación de la licencia.

### 8. Micro-interacciones
- Hover en filas de tabla con transición 150ms
- Hover en botones con escala sutil
- Transiciones suaves en navegación del sidebar
- Animación de revelado para la access key

