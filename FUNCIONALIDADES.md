# FocusFlow — Funcionalidades

> Documento vivo. Se actualiza con cada cambio significativo.

## 1. Gestión de Tareas

### 1.1 Crear tarea
- Input inline en la lista (brain dump).
- Atajo `Enter` para guardar instantáneamente, sin clicks.
- Campos: título + estimatedPomodoros (por defecto 1) + `isQuickWin` (toggle ⚡).
- Las tareas se etiquetan con `tags: string[]` (V1: `inbox` | `today`).

### 1.2 Estados de tarea
- `pending` → `in-progress` → `completed`.
- **Solo una tarea puede estar `in-progress`**. Al seleccionar otra, la anterior vuelve a `pending` automáticamente.

### 1.3 Ordenamiento
- Quick wins primero (`isQuickWin === true`).
- Luego por fecha de creación ascendente.

### 1.4 Toggle Inbox / Hoy
- Botón segmentado para filtrar tareas por tag.
- Cada lista muestra tareas pendientes + completadas por separado.

### 1.5 Inbox Emergency (Limpieza rápida)
- Botón "Limpiar inbox" cuando hay items en inbox.
- Muestra tareas **una por una** con acciones:
  - **Hoy** → mueve a tag `today`
  - **Borrar** → elimina permanentemente
- Barra de progreso visual.
- Objetivo: evitar que el inbox sea fuente de ansiedad.

### 1.6 Edición inline
- Doble click en el **título** o en el contador **🍅** entra modo edición.
- Input para título + input numérico para pomodoros estimados.
- `Enter` guarda, `Escape` cancela, `onBlur` guarda automáticamente.
- Botón **✎** visible en hover como alternativa al doble click.

### 1.7 Micro-tareas (Subtareas)
- Cada tarea puede tener una lista de **micro-pasos** (`subtasks`).
- Objetivo: descomponer tareas abrumadoras (ej: *"Hacer la declaración de la renta"* → Buscar DNI → Descargar borrador → Revisar gastos → Enviar).
- Cada micro-paso completado da una micro-dosis de dopamina.
- **UI**: indicador `X/Y micro-pasos` clickable para expandir/colapsar.
- **En modo enfoque**: las subtareas se expanden automáticamente.
- Checkboxes pequeños para marcar como completada.
- Input inline `+ micro-paso (Enter)` para agregar nuevas.
- Botón **✕** al hover para eliminar micro-paso individual.
- Progreso visual: contador completadas / total.

---

## 2. Modo Enfoque (Focus Mode)

- Seleccionar **una única tarea activa** la convierte en `in-progress`.
- El resto de tareas pendientes se **ocultan** para reducir distracción.
- Toggle "Ver tareas" muestra la lista con opacidad reducida (60%) sin salir del modo enfoque.
- Botón "Salir del enfoque" deselecciona y vuelve todo a `pending`.
- Atajo `Esc` sale del modo enfoque.
- **Distraction Shield**: botón para copiar al portapapeles un mensaje de "modo enfoque" con hora estimada de finalización, para pegar en Slack/Teams/WhatsApp y reducir ansiedad social.

---

## 3. Temporizador Pomodoro

### 3.1 Arquitectura
- **Web Worker** (`timer.worker.ts`) para precisión de timer aunque cambie de pestaña.
- **TimerService** (singleton puro, fuera de React) como único intermediario entre worker y store.
- El store **nunca** habla directamente con el worker.

### 3.2 Estados del timer (máquina de estados finita)
```
idle ──start──► work_running ──pause──► work_paused
    ▲                                      │
    └────────────────────resume────────────┘

work_running ──completed──► break_ready ──start──► break_running
    │                            │                       │
    │                            └──skip_break───────────┘
    │                                                    │
    └──reset─────────────────────────────────────────────┘

break_running ──completed──► work_ready ──start──► work_running
    │                          │
    └──skip_break──────────────┘
```

### 3.3 Controles
- **Iniciar / Pausar** (`Space` atajo de teclado)
- **Reset** (`R` atajo de teclado)
- **Skip break** — solo visible durante break
- **Duraciones rápidas**: botones 5m, 15m, 25m, 50m (solo en modo work y detenido)
- **Duración manual**: input numérico al lado de los botones rápidos. Escribís los minutos, Enter, y listo. Rango: 1-180 min.
- **"Solo 5 min"** en HeroTimer: inicia sesión de 5 minutos **sin mutar** la configuración global.

### 3.4 Visual
- **Timer circular** en HeroTimer (tamaño grande, 160px) — el elemento visual dominante de la pantalla.
- **CompactTimer** en header (tamaño pequeño, 36px) para contexto persistente.
- Barra de progreso con color: naranja para work, azul para break.
- Contador de pomodoros completados hoy en el header.

### 3.5 Completar sesión
- Al terminar work: registra sesión en historial, incrementa `pomodorosToday`, avanza `completedPomodoros` de la tarea activa.
- Al terminar break: vuelve a `work_ready`.
- Historial de sesiones **capado a 500** (drop oldest).

---

## 4. Transición Post-Enfoque

- Al completar una tarea en modo enfoque: overlay fullscreen con confeti + sonido "pop".
- Botón grande: **"¿Qué sigue?"** → cierra overlay y muestra lista.
- Botón secundario: **"Tomar un respiro"** → inicia break inmediatamente.
- Auto-dismiss en 4 segundos con barra de cuenta regresiva.
- `Escape` cierra el overlay.

---

## 5. Feedback de Dopamina

- **Confeti** al completar tarea (dos ráfagas desde costados, colores de paleta FocusFlow).
- **Sonido "pop"** al completar tarea.
- **Sonido "ding"** al completar pomodoro (dos tonos tipo campana).
- Ambos sonidos generados vía Web Audio API (`OscillatorNode`), sin dependencias de audio externas.
- **Ruido de fondo** opcional: marrón o blanco (loop continuo vía `AudioBufferSourceNode`).

---

## 6. Accesibilidad

### 6.1 `prefers-reduced-motion`
- Si el usuario tiene configurado "reducir movimiento" en su sistema:
  - **Sin confeti**.
  - **Sin `animate-bounce`** en el ícono de celebración.
  - **Sin transiciones CSS** (regla global `@media (prefers-reduced-motion: reduce)`).
  - Barra de progreso sin animación de transición.

### 6.2 Atajos de teclado
| Tecla | Acción | Condición |
|-------|--------|-----------|
| `Space` | Start / Pause timer | No estás escribiendo en input |
| `Esc` | Cierra ayuda → overlay → focus mode | Siempre |
| `/` | Enfoca input de nueva tarea | No estás escribiendo en input |
| `R` | Reset timer | No estás escribiendo en input |
| `?` | Mostrar / ocultar ayuda de atajos | No estás escribiendo en input |

### 6.3 Ayuda de atajos (Keyboard Help)
- Presionar `?` abre un modal con todos los atajos de teclado.
- Diseño limpio: tecla en `kbd` + descripción alineada a la derecha.
- Footer indica que los atajos solo funcionan fuera de campos de texto.
- `Esc` cierra el modal.
- Click fuera del modal también lo cierra.

---

## 7. Configuración (Settings)

- **Timer**: sliders para work (5-90 min) y break (1-30 min).
- **Sonido**: toggle efectos de sonido + **botones de preview** para probar "pop" (tarea completada) y "ding" (pomodoro completado) sin tener que completar una tarea real + selector ruido de fondo (off / marrón / blanco).
- **Apariencia**: toggle modo oscuro.
- **Datos**: Exportar JSON / Importar JSON (backup completo con validación de campos).

---

## 8. Persistencia

- **localStorage** vía `zustand/middleware` (`persist`).
- Campos persistidos: `tasks`, `sessions`, `selectedTaskId`, `pomodorosToday`, `lastResetDate`, `settings`.
- **NO** persistidos: `timer` (se resetea al recargar), `transition`.

---

## 9. Reset Diario

- Política: `lastResetDate` en formato `YYYY-MM-DD` **local** del usuario (`sv-SE` locale).
- Si la fecha local cambia: resetea `pomodorosToday` a 0.
- **NO** reinicia timer activo ni deselecciona tareas.

---

## 10. Tech Stack

| Capa | Tecnología |
|------|------------|
| Frontend | React 19 + TypeScript |
| Build | Vite 8 |
| Estado | Zustand 5 + persist middleware |
| UI | TailwindCSS 4 + Shadcn/ui (Dialog, Slider, Sonner) |
| Sonido | Web Audio API nativo |
| Confeti | canvas-confetti |
| Tests | Vitest + jsdom + @testing-library/react |

---

## Changelog

### 2026-04-28
- **Refactor arquitectura**: TimerService singleton, máquina de estados del timer, eliminación de V2 features (OKR, gamificación, dashboard, history, notifications).
- **Fix timezone**: `todayLocal()` con locale `sv-SE` en vez de UTC.
- **Fix "Solo 5 min"**: ya no muta `settings.workTime`.
- **Modelo**: `Task.source` → `Task.tags`.
- **Tests**: 35 tests cubriendo store + TimerService.

### 2026-04-28 (keyboard shortcuts)
- Atajos globales: `Space` (start/pause), `Esc` (salir focus/overlay), `/` (nueva tarea), `R` (reset).

### 2026-04-28 (reduced motion)
- Respeto de `prefers-reduced-motion: reduce` en confeti, animaciones CSS y transiciones.

### 2026-04-28 (bugfix migración)
- Añadida función `migrate` en `zustand/persist` para convertir datos antiguos de localStorage automáticamente:
  - `task.source` → `task.tags`
  - `timer.isRunning + timer.mode` → `timer.status`
  - Elimina campos V2 (`objectives`, `stats`) del persist.

### 2026-04-29 (Distraction Shield)
- Botón "Copiar mensaje de enfoque" en HeroTimer (solo visible durante work running con tarea activa).
- Genera mensaje con hora de finalización estimada: *"Estoy en modo enfoque hasta las 14:25. Te respondo después."*
- Copia al portapapeles vía `navigator.clipboard.writeText` + toast de confirmación.

### 2026-04-29 (Edición inline)
- Doble click en título o contador 🍅 entra modo edición inline.
- Permite editar título y pomodoros estimados. Enter guarda, Escape cancela.

### 2026-04-29 (Service Worker)
- Reemplazado SW manual por `vite-plugin-pwa` + Workbox.
- Precachea automáticamente todos los assets de build (JS, CSS, fuentes).
- La PWA ahora funciona **offline** correctamente.

### 2026-04-29 (Micro-tareas)
- Añadido campo `subtasks` al modelo `Task`.
- UI en TaskItem: checkboxes, input inline, progreso `X/Y micro-pasos`.
- Auto-expansión en modo enfoque.
- Tests: 3 tests para addSubtask / toggleSubtask / deleteSubtask.

### 2026-04-29 (Keyboard Help + Sound Preview)
- **Keyboard Help**: presionar `?` abre modal con todos los atajos. `Esc` o click fuera lo cierra.
- **Sound Preview**: botones "Probar pop" y "Probar ding" en Settings para escuchar sonidos sin completar tareas.
- Refactor: funciones `playPop` / `playDing` extraídas a `feedback/lib/soundFX.ts` para reutilización.

### 2026-04-29 (Duración manual del timer)
- Input numérico en TimerControls para ingresar minutos manualmente (1-180 min).
- Funciona junto a los botones rápidos (5m, 15m, 25m, 50m).
- Validación con toast de error si el valor está fuera de rango.

### 2026-04-29 (Mejoras de diseño)
- **Timer agrandado**: de 96px a 160px en HeroTimer — ahora es el foco visual dominante.
- **Jerarquía modo enfoque**: título activo en `text-xl font-bold`, badge "🎯 Modo enfoque" con tracking más amplio.
- **"Solo 5 min" más grande**: `text-sm font-semibold` con padding generoso y borde redondeado.
- **Checkbox rediseñado**: de círculo vacío a cuadrado redondeado (`rounded-md`), más reconocible como checkbox.
- **Empty state con personalidad**: emoji grande + mensaje amigable según contexto (inbox vs today).
- **Micro-animations en subtareas**: `active:scale-75` en checkbox de subtarea para feedback táctil inmediato.
- **Eliminadas tabs de navegación**: solo había una vista ("Tareas"), eran ruido visual innecesario.
