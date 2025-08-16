# Guía del Sistema Premium de Temas - ISPC FOOD

## 🎨 Sistema de Temas Implementado

### Características Principales

#### 1. **Detección Automática por Hora**
- **Tema Automático**: Cambia según la hora del navegador
  - 🌙 **Modo Oscuro**: 19:00 - 06:59
  - ☀️ **Modo Claro**: 07:00 - 18:59
- **Persistencia**: Guarda la preferencia del usuario en localStorage
- **Selector Visual**: Widget flotante con hora actual

#### 2. **Paleta de Colores Premium**

##### 🌞 Tema Claro (Pasteles)
- **Fondo Principal**: Blanco suave (#fafafa)
- **Superficies**: Cremas y blancos pasteles
- **Texto**: Grises oscuros elegantes
- **Acentos**: Dorados premium (#d4af37, #b8860b)

##### 🌙 Tema Oscuro (Elegantes)
- **Fondo Principal**: Negro suave (#0a0a0a)
- **Superficies**: Grises oscuros premium
- **Texto**: Blancos y grises claros
- **Acentos**: Dorados brillantes (#f4d03f, #e6b800)

#### 3. **Tipografía Premium**
- **Títulos**: Playfair Display (serif elegante)
- **Texto**: Inter (sans-serif moderno)
- **Pesos**: De 100 a 900 disponibles

## 🛠️ Componentes Implementados

### ThemeService
```typescript
// Cambio manual de tema
themeService.setTheme('light' | 'dark' | 'auto');

// Obtener tema actual
themeService.currentTheme$.subscribe(theme => {
  console.log('Tema actual:', theme);
});
```

### ThemeSelectorComponent
```html
<!-- Selector automático incluido en app.component -->
<app-theme-selector></app-theme-selector>
```

### Componentes Actualizados
- ✅ NavComponent - Navegación premium
- ✅ ChatBotComponent - Chat con glassmorphism
- ✅ FooterComponent - Footer elegante
- ✅ HomeComponent - Página principal premium
- ✅ AppComponent - Integración completa

## 🎨 Clases CSS Premium Disponibles

### Efectos Glassmorphism
```html
<div class="glass-card">Contenido con efecto vidrio</div>
<button class="glass-button">Botón transparente</button>
```

### Tipografía Premium
```html
<h1 class="display-premium">Título con gradiente dorado</h1>
<p class="text-premium">Texto con color dorado</p>
<p class="text-elegant">Texto elegante con Playfair</p>
<span class="text-highlight">Texto destacado</span>
```

### Cards Premium
```html
<div class="card-premium">
  <h3>Título del Card</h3>
  <p>Contenido con efectos premium</p>
</div>
```

### Botones Mejorados
```html
<!-- Botones Bootstrap con estilos premium automáticos -->
<button class="btn btn-primary">Botón Principal</button>
<button class="btn btn-secondary">Botón Secundario</button>
<button class="btn btn-success">Botón Éxito</button>
```

### Layouts Premium
```html
<div class="premium-container">
  <div class="premium-section">
    <div class="premium-card-grid">
      <!-- Cards se distribuyen automáticamente -->
    </div>
  </div>
</div>
```

## 🎯 Efectos Especiales

### Botón Flotante (FAB)
```html
<button class="fab-premium">
  <i class="fas fa-plus"></i>
</button>
```

### Estados de Usuario
```html
<div class="status-online">👤 Usuario Online</div>
<div class="status-away">👤 Usuario Ausente</div>
<div class="status-offline">👤 Usuario Offline</div>
```

### Tooltips Premium
```html
<span class="tooltip-premium" data-tooltip="Información adicional">
  Hover para ver tooltip
</span>
```

### Enlaces Premium
```html
<a href="#" class="link-premium">Enlace con animación</a>
```

### Tags/Etiquetas
```html
<span class="tag-premium">Premium</span>
<span class="tag-premium">Nuevo</span>
```

## 📱 Responsividad

El sistema es completamente responsivo:
- **Desktop**: Experiencia completa con todos los efectos
- **Tablet**: Adaptación automática de espacios
- **Mobile**: Optimización para pantallas pequeñas

## 🔧 Cómo Usar en Componentes

### 1. En Templates HTML
```html
<!-- Usar clases premium directamente -->
<div class="card-premium">
  <h2 class="display-premium">Mi Título</h2>
  <p class="text-elegant">Descripción elegante</p>
  <button class="btn btn-primary">Acción</button>
</div>
```

### 2. En Componentes TypeScript
```typescript
import { ThemeService } from './services/theme.service';

constructor(private themeService: ThemeService) {}

cambiarTema() {
  this.themeService.setTheme('dark');
}
```

### 3. Formularios Premium
```html
<form>
  <div class="mb-3">
    <label class="form-label">Nombre</label>
    <input type="text" class="form-control" placeholder="Tu nombre">
  </div>
  <button type="submit" class="btn btn-primary">Enviar</button>
</form>
```

### 4. Tablas Premium
```html
<table class="table table-striped table-hover">
  <thead>
    <tr>
      <th>Producto</th>
      <th>Precio</th>
      <th>Acciones</th>
    </tr>
  </thead>
  <tbody>
    <!-- Filas automáticamente con estilo premium -->
  </tbody>
</table>
```

## 🎨 Variables CSS Disponibles

### Colores Base
- `--text-primary` - Texto principal
- `--text-secondary` - Texto secundario
- `--text-muted` - Texto deshabilitado
- `--surface-primary` - Fondo principal
- `--surface-elevated` - Superficies elevadas
- `--surface-card` - Fondo de cards

### Acentos Dorados
- `--accent-gold` - Dorado principal
- `--gold-500`, `--gold-600`, etc. - Variaciones
- `--accent-gradient` - Gradiente dorado

### Sombras
- `--shadow-soft` - Sombra suave
- `--shadow-premium` - Sombra premium
- `--shadow-glass` - Sombra glassmorphism

### Bordes
- `--border-soft` - Borde suave
- `--border-medium` - Borde medio
- `--border-glass` - Borde glassmorphism

## 🚀 Próximas Mejoras Sugeridas

1. **Temas Estacionales**: Navidad, verano, etc.
2. **Más Variaciones**: Temas azul, verde, etc.
3. **Animaciones Avanzadas**: Micro-interacciones
4. **Modo Alto Contraste**: Accesibilidad
5. **Temas Personalizados**: Para diferentes tipos de usuario

## 📋 Lista de Verificación

- ✅ Sistema de temas automático
- ✅ Detección por hora del navegador
- ✅ Persistencia en localStorage
- ✅ Selector visual flotante
- ✅ Paletas de colores premium
- ✅ Tipografía premium (Playfair + Inter)
- ✅ Efectos glassmorphism
- ✅ Bootstrap override completo
- ✅ Componentes principales actualizados
- ✅ Utilidades CSS premium
- ✅ Responsividad completa
- ✅ Documentación completa

¡El sistema premium está completamente implementado y listo para usar! 🎉
