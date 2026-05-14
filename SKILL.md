---
name: ui-ux-pro-max
description: >
  Skill para mejorar la interfaz gráfica del sistema de inventario streetwear.
  Aplica principios avanzados de UI/UX sobre el stack Next.js 16 + TypeScript + Supabase
  con tema oscuro (#111113 base) y estilos en línea (sin Tailwind).
  Úsalo siempre que el usuario quiera mejorar el diseño, la experiencia de usuario,
  la navegación, los colores, la tipografía, los formularios o cualquier componente visual
  del proyecto. También aplica cuando se mencionen palabras como "diseño", "interfaz",
  "se ve feo", "mejorar el look", "más bonito", "UX", "UI", "visual" o similar.
---

# UI/UX Pro Max — Sistema de Inventario Streetwear

## Contexto del proyecto

- **Framework:** Next.js 16.2.6 (App Router, Turbopack)
- **Lenguaje:** TypeScript
- **Base de datos:** Supabase (PostgreSQL)
- **Deploy:** Vercel
- **Estilos:** Inline CSS (sin Tailwind, sin CSS Modules)
- **Autenticación:** Cookie `inv_session` (httpOnly: false, rol: `administrador` | `bodeguero`)
- **Sidebar fijo:** `src/components/Sidebar.tsx` — 240 px, `height: 100vh`, `position: fixed`
- **Layout:** `src/components/LayoutShell.tsx` — contenido con `marginLeft: 240px`

## Paleta de colores (Design Tokens)

```
Fondo principal:   #111113   (aside/sidebar)
Fondo contenido:   #09090b   (body/main)
Superficie cards:  #18181b   (tarjetas, modales)
Superficie elevada:#1c1c1f   (inputs, filas hover)
Borde sutil:       #27272a
Borde activo:      #3f3f46
Texto principal:   #ffffff
Texto secundario:  #a1a1aa
Texto apagado:     #52525b
Acento blanco:     #ffffff   (borde activo sidebar)
Acento verde:      #22c55e   (stock OK, activo, éxito)
Acento rojo:       #ef4444   (errores, baja existencia)
Acento amarillo:   #eab308   (advertencias, pendiente)
Acento azul:       #3b82f6   (información, solicitudes)
```

## Tipografía

```
Font family: system-ui, -apple-system, sans-serif (heredado)
Tamaños:
  - Page title:   22–24px, fontWeight 700–800, color #ffffff
  - Section:      13–14px, fontWeight 600, color #a1a1aa, uppercase, letterSpacing 1–2px
  - Body:         13–14px, fontWeight 400, color #a1a1aa
  - Mini-label:   10px, fontWeight 500, color #71717a, uppercase, letterSpacing 1px
  - Badge:        10–11px, padding 2px 8px, borderRadius 4px
```

## Componentes estándar del proyecto

### StatCard (Dashboard)
```tsx
// Fondo: #18181b, borderTop de color de acento, número en blanco resaltado
<div style={{
  backgroundColor: '#18181b', borderRadius: '12px',
  padding: '24px', borderTop: '3px solid <COLOR_ACENTO>',
}}>
  <p style={{ fontSize: '13px', color: '#71717a', letterSpacing: '1px' }}>ETIQUETA</p>
  <p style={{ fontSize: '32px', fontWeight: '800', color: '#ffffff' }}>NÚMERO</p>
</div>
```

### Tabla de datos (historial / listados)
```tsx
// Cabecera: #18181b, color #71717a, uppercase, fontSize 11px
// Fila: borde inferior #27272a, hover #1c1c1f
// Celdas: color #a1a1aa, fontSize 13px
```

### Mini-labels en filas
```tsx
// Para describir campos secundarios en listas
<span style={{
  fontSize: '10px', color: '#71717a',
  textTransform: 'uppercase', letterSpacing: '1px',
  fontWeight: '500',
}}>Etiqueta</span>
```

### Badges de estado
```tsx
// activo   → backgroundColor: '#14532d', color: '#22c55e'
// inactivo → backgroundColor: '#3f3f46', color: '#a1a1aa'
// pendiente→ backgroundColor: '#422006', color: '#f97316'
// aprobado → backgroundColor: '#14532d', color: '#22c55e'
// rechazado→ backgroundColor: '#450a0a', color: '#ef4444'
```

### Botones
```tsx
// Primario (acción principal)
{ backgroundColor: '#ffffff', color: '#09090b', fontWeight: '600',
  borderRadius: '8px', padding: '10px 20px', border: 'none', cursor: 'pointer' }

// Secundario / peligro
{ backgroundColor: '#27272a', color: '#a1a1aa', border: '1px solid #3f3f46',
  borderRadius: '8px', padding: '10px 20px', cursor: 'pointer' }

// Destructivo
{ backgroundColor: '#450a0a', color: '#ef4444', border: '1px solid #7f1d1d',
  borderRadius: '8px', padding: '10px 20px', cursor: 'pointer' }
```

### Inputs y selects
```tsx
{ width: '100%', backgroundColor: '#27272a', border: '1px solid #3f3f46',
  borderRadius: '8px', padding: '10px 14px', color: '#ffffff',
  fontSize: '14px', outline: 'none' }
```

### Modales / drawers
```tsx
// Overlay
{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }
// Panel
{ backgroundColor: '#18181b', borderRadius: '16px', padding: '32px',
  width: '520px', maxWidth: '90vw', border: '1px solid #27272a' }
```

## Reglas de mejora UI/UX

1. **Mantener el tema oscuro** — nunca cambiar fondos a blancos o grises claros.
2. **Sin Tailwind** — todo estilo va en `style={{}}` inline.
3. **Consistencia de espaciado** — usar múltiplos de 4 (4, 8, 12, 16, 24, 32 px).
4. **Accesibilidad mínima** — color de texto con contraste suficiente sobre fondos oscuros (usar tokens definidos).
5. **Feedback visual** — estados de carga con `⏳`, errores con badge rojo, éxito con verde.
6. **Responsive básico** — el sidebar tiene `position: fixed`, el contenido usa `marginLeft: 240px` y `padding: 32px`.
7. **Sin emojis en tablas ni cards** — solo en el Sidebar (iconos de navegación).
8. **Mini-labels** — siempre etiquetar campos secundarios en listas con mini-labels para que el contenido sea auto-descriptivo.

## Flujo de mejora con /ui-ux-pro-max

Cuando el usuario pida mejorar una página o componente:

1. Lee el archivo de la página (`src/app/<ruta>/page.tsx`).
2. Identifica: jerarquía visual, legibilidad, consistencia de colores, espaciado, estados vacíos.
3. Aplica los tokens de color y componentes estándar definidos arriba.
4. Mantén la lógica de negocio intacta — solo mejora la presentación.
5. Añade mini-labels donde falten, mejora badges, unifica botones.
6. Si hay formularios, revisa que inputs y labels sean consistentes.

## Archivos clave del proyecto

```
src/
├── app/
│   ├── page.tsx              ← Dashboard (StatCards + resumen)
│   ├── prendas/page.tsx      ← CRUD prendas con mini-labels
│   ├── solicitudes/page.tsx  ← Solicitudes con mini-labels
│   ├── inventario/page.tsx   ← Stock en bodega
│   ├── salidas/page.tsx      ← Salidas con id_cliente
│   ├── clientes/page.tsx     ← Aliados multimarca
│   ├── colecciones/page.tsx  ← Colecciones de temporada
│   └── reportes/page.tsx     ← Reportes y estadísticas
├── components/
│   ├── Sidebar.tsx           ← Navegación fija (240px)
│   └── LayoutShell.tsx       ← Shell con header
```
