# 🎯 Sistema de Tour Guiado - Usuario Demo

## 📋 Descripción
Sistema de tour interactivo específicamente diseñado para el usuario demo (`demo@demo.com`) que proporciona una guía completa de todas las funcionalidades de la plataforma.

## ✨ Características Principales

### 🔐 Activación Automática
- **Usuario específico**: Solo se activa para `demo@demo.com`
- **Login automático**: Se inicia automáticamente al hacer login
- **Notificación**: Muestra mensaje informativo al iniciar

### 📱 Modales Específicos por Sección
Cada página tiene su propio modal que se abre automáticamente al navegar:

#### 🏠 **Home** (`/home`)
- Información general del restaurante
- Navegación intuitiva
- Especialidades del día
- Comentarios de clientes
- Ubicación y horarios

#### 🍔 **Carta** (`/carta`)
- Catálogo completo de productos
- Filtros por categorías
- Detalles de ingredientes y precios
- Agregar al carrito
- Búsqueda de productos
- Imágenes de alta calidad

#### 🛒 **Carrito** (`/carrito`)
- Gestión de productos
- Modificar cantidades
- Eliminar productos
- Ver total en tiempo real
- Checkout seguro
- Guardar para después

#### 📊 **Dashboard** (`/dashboard`)
- Historial de pedidos
- Seguimiento en tiempo real
- Facturas y comprobantes
- Estadísticas de consumo
- Gestión de direcciones
- Puntos de fidelidad (versión completa)

#### 👤 **Perfil** (`/perfil`)
- Editar información personal
- Actualizar dirección
- Cambiar foto de perfil
- **RESTRICCIÓN DEMO**: No puede editar email
- **VERSIÓN COMPLETA**: Email editable
- Eliminar cuenta
- Configurar notificaciones

#### 📞 **Contacto** (`/contacto`)
- Mensajes directos
- Información de contacto
- Formulario de consultas
- Mapa interactivo
- Horarios de atención
- Redes sociales

#### 👥 **Quiénes Somos** (`/quienes-somos`)
- Equipo de desarrollo
- Tecnologías utilizadas
- Historia del proyecto
- Contacto con desarrolladores
- Créditos

## 🎮 Flujo de Funcionamiento

### 1. **Inicio del Tour**
```
Usuario demo hace login → Mensaje de tour → Navegación a /home → Modal automático
```

### 2. **Navegación Entre Secciones**
```
Usuario en modal → Clic "Siguiente Sección" → Navegación automática → Nuevo modal
```

### 3. **Exploración Libre**
```
Usuario en modal → Clic "Explorar Libremente" → Cierra modal → Navegación manual
```

### 4. **Navegación Manual Durante Tour**
```
Tour activo → Usuario navega manualmente → Modal automático de la nueva sección
```

## 🔧 Componentes Técnicos

### Servicios
- **`TourService`**: Gestión completa del tour
- **`AuthService`**: Detección de usuario demo y activación

### Componentes
- **`TourModalComponent`**: Modal específico de página
- **`NavComponent`**: Botón de reinicio de tour

### Rutas Monitoreadas
Todas las rutas principales están incluidas en el sistema de tour.

## 🎨 Características Visuales

### Modal de Página
- **Diseño destacado**: Fondo oscuro y modal grande
- **Grid numerado**: Funcionalidades enumeradas
- **Íconos contextuales**: Diferentes colores según tipo
- **Barra de progreso**: Indica sección actual
- **Animaciones**: Transiciones suaves

### Indicador de Tour Activo
- **Botón dinámico**: Cambia color y texto cuando está activo
- **Animación**: Ícono giratorio cuando el tour está en progreso
- **Solo visible**: Para usuario demo autenticado

## 🚀 Cómo Usar

### Para el Usuario Demo:
1. **Login**: Usar `demo@demo.com` con cualquier contraseña válida
2. **Tour automático**: Se inicia solo, navegando a la página principal
3. **Seguir el tour**: Usar botones "Siguiente Sección" para tour guiado
4. **Explorar**: Usar "Explorar Libremente" para navegar sin restricciones
5. **Reiniciar**: Usar botón "Tour Activo" en navegación para reiniciar

### Opciones de Navegación:
- **Siguiente Sección**: Avanza al siguiente paso del tour
- **Sección Anterior**: Retrocede al paso anterior
- **Explorar Libremente**: Cierra modal pero mantiene tour activo
- **Terminar Tour**: Finaliza completamente el tour

## 🔄 Estados del Tour

### Tour Inactivo
- Usuario normal o no demo
- Sin modales automáticos
- Sin botón de tour en navegación

### Tour Activo - Modal Visible
- Modal específico de página abierto
- Botón "Tour Activo" con animación
- Navegación controlada por tour

### Tour Activo - Exploración Libre
- No hay modal visible
- Usuario puede navegar libremente
- Al cambiar de página se abre modal correspondiente
- Botón "Tour Activo" disponible para control

## 📱 Responsive
- **Desktop**: Modal grande con grid de 1 columna
- **Tablet**: Modal adaptativo
- **Mobile**: Modal a pantalla completa, botones apilados

## 🎯 Casos de Uso Especiales

### Email en Perfil (Usuario Demo)
- **Restricción**: Campo email deshabilitado
- **Mensaje especial**: Indica que en versión completa es editable
- **Funcionalidad**: Resto de campos editables normalmente

### Reinicio de Tour
- **Disponible siempre**: Para usuario demo autenticado
- **Reinicio completo**: Vuelve a la primera sección
- **Estado limpio**: Resetea progreso y comienza desde cero

## 🛠️ Archivos Principales

```
src/app/
├── services/
│   └── tour.service.ts          # Lógica principal del tour
├── shared/
│   └── tour-modal/              # Componente del modal
│       ├── tour-modal.component.ts
│       ├── tour-modal.component.html
│       └── tour-modal.component.css
└── shared/nav/
    ├── nav.component.ts         # Botón de reinicio
    ├── nav.component.html
    └── nav.component.css
```

## 📊 Métricas del Tour
- **7 secciones** incluidas
- **+40 funcionalidades** documentadas
- **100% responsive**
- **Navegación automática** entre secciones
- **Estado persistente** durante la sesión
