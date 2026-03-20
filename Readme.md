# 🦓 Zebra Fitness Tracking

A full-featured Progressive Web App for workout tracking, built with **Angular 20** and **standalone components** architecture (zero NgModules).

Create custom workout plans, log training sessions, and track your progress over time — with a native-app feel on any device.

> **Design, frontend, and database — all built from scratch by one person.**

---

## At a Glance

| | |
|---|---|
| **Components** | 59 |
| **Core Services** | 24 |
| **Models / DTOs** | 41 |
| **Routes** | 18 |
| **Custom SVG Icons** | 28 |
| **Build Environments** | 5 |

---

## Stack

| Technology | Role |
|---|---|
| Angular 20 | Framework — standalone components, Signals, `@if`/`@for` syntax |
| TypeScript 5.8 | Strict mode throughout |
| GSAP 3.14 | Animations — page transitions, drag, parallax, expand/collapse |
| GSAP Draggable | Swipe-to-close, swipe-to-delete, drag-to-reorder |
| RxJS 7.8 | Reactive programming, API orchestration |
| Angular Signals | UI state management — modals, spinners, overlays, menus |
| Angular Material 20 | SVG icon registry, CDK |
| SCSS | Custom properties, glassmorphism, dark theme |
| Angular Service Worker | PWA — caching, updates, offline support |

---

## Architecture Highlights

### Multi-Snapshot Database

The database preserves the actual state of data over time through a versioning system:

```
Template (workout plan)
  └── Snapshot on activation or edit
       └── Duplicated into "Execution" counterpart
            └── Snapshot on each completed workout
```

Every time a workout plan is activated or modified, a snapshot freezes the current structure (workouts → exercises → sets). When you actually perform a workout, a separate execution snapshot is created, allowing free modifications without touching the original template. Your training history stays intact even as your plans evolve.

### 4-Layer Overlay System

Four independent overlay layers managed by Signal-based services, rendered in `app.component.html`:

```
Layer 1 → Modals         (GenericModalComponent)
Layer 2 → Spinners       (SpinnerComponent)
Layer 3 → Bottom Sheets  (BottomSheetWrapper)
Layer 4 → Focus Overlays (FocusOverlayWrapper)
```

Each layer supports **dynamic component injection** — any component can be loaded into any layer at runtime without coupling. A single `effect()` coordinates scroll-lock across all layers.

### Catalog-Driven API — Zero Hardcoded URLs

Every HTTP call goes through a centralized `ApiCatalogService`. Endpoints are defined in environment-specific JSON files loaded at startup.

- One method (`executeApiCall<T>()`) handles all HTTP operations
- Path parameter substitution (`:userId` → actual value)
- Automatic mock redirection in development (`/assets/mock/...`)
- Environment switch without recompilation

### GSAP Outside Angular Zone

All GSAP animations run outside Angular's change detection (`ngZone.runOutsideAngular()`), preventing unnecessary re-renders on every animation frame. Only meaningful state changes re-enter the zone via `ngZone.run()`.

### Auto-Save with Recovery

Editing forms auto-save to localStorage every 5 seconds:

- **User-specific keys** — no collisions between users
- **Schema versioning** — invalidates data from outdated versions
- **24-hour expiry** — prevents stale data from resurfacing
- If the app crashes or the browser closes, the user picks up where they left off

### Cross-Platform Haptic Feedback

The `HapticService` provides tactile feedback with six distinct patterns (light, medium, heavy, success, warning, error). On iOS, where the Vibration API isn't available, it uses a WebKit workaround: creating an invisible checkbox with the `switch` attribute and simulating a click to trigger native haptic feedback.

---

## Core Services

### AuthService
Complete JWT lifecycle: login, signup, logout, auto-refresh scheduled 5 minutes before expiry, manual JWT decoding without external libraries, token verification at app startup via `APP_INITIALIZER`.

### ApiCatalogService
Centralized API orchestration. Loads endpoint catalog from JSON at boot, supports mock mode, path/query parameter injection, blob responses for Excel export.

### SpinnerService
The most sophisticated service — manages loading states with result feedback (success/error/warning/info), minimum display duration, force-show mode, and Promise-based completion for async/await integration.

### BottomSheetService
Drawer with swipe-to-dismiss via GSAP Draggable. Configurable close threshold (150px), physics-based inertia, backdrop opacity synced to drag progress, animated snap-back if gesture doesn't exceed threshold. Injects a `BottomSheetController` into loaded components for bidirectional communication.

### FocusOverlayService
Dynamically loads any component into a full-screen overlay with a custom `Injector`. Supports `@Input` passthrough via `setInput()` and a callback system (`onPositioned`, `onReadyToShow`, `applyNewOrder`) for coordinating drag-and-drop reordering.

### PageAnimationService
Page transitions hooked into Router events. Fade-out on `GuardsCheckEnd`, fade-in on `NavigationEnd`, animation cancellation on `NavigationCancel/Error`.

---

## UI Components

### Bottom Sheet
Slide-up drawer with GSAP Draggable. Swipe down to dismiss, with physics inertia and backdrop opacity synchronized to drag progress.

### Multi-Option Button
Expandable button with a **7-phase GSAP timeline**: hides siblings → collapses widths → removes gap → hides base content → expands with bounce → adds state class → reveals options. Full reverse sequence on close.

### Swipe-to-Delete
GSAP Draggable on the X axis with constrained bounds (-80px to 0). Delete button opacity reveals progressively with drag distance. Snaps to open or closed position based on a 50% threshold.

### Workout List Selector
Exercise picker with real-time filtering (Reactive Forms + `valueChanges`), displayed inside a bottom sheet. Selection dismisses the sheet and returns the chosen exercise to the parent component.

---

## Authentication Flow

```
Login → { token, refreshToken, user }
  → Save state → Schedule auto-refresh → Load configurations

Every HTTP request → AuthInterceptor adds Bearer token
  → On 401: refresh token → retry request or logout

App restart → APP_INITIALIZER
  → Load from localStorage → Verify expiry → Refresh if needed
```

**Route Guards:** Auth, NoAuth, Admin, PendingChanges, Fade (animation trigger).

---

## Design System

- **Theme:** Dark with glassmorphism (`backdrop-filter: blur`, gradient borders)
- **Accent:** `#00ffe1` (cyan)
- **Typography:** Poppins (Google Fonts)
- **Icons:** 28 custom SVGs registered via `MatIconRegistry`, using `fill="currentColor"` for CSS color inheritance
- **Responsive:** CSS custom properties for bottom menu offset and floating button coordination

---

## PWA

- Installable on any device as a native app
- Service Worker with asset and API caching strategies
- Offline indicator component
- Update banner with one-click refresh
- Background update polling every 6 hours
- Splash screen during bootstrap

---

## Project Structure

```
src/app/
├── common/                     → Constants and shared utilities
├── components/
│   ├── shared/                 → 28 reusable UI components
│   │   ├── accordion/          → Animated accordion system
│   │   ├── bottom-menu/        → Auto-hiding bottom navigation
│   │   ├── bottom-sheet/       → Swipe-to-dismiss drawer
│   │   ├── focus-overlay/      → Dynamic component overlay
│   │   ├── generic-modal/      → Customizable modal
│   │   ├── multi-option-button/→ 7-phase expandable button
│   │   ├── spinner/            → Stateful loading indicator
│   │   ├── toast/              → Non-blocking notifications
│   │   └── ...
│   ├── home-component/         → Dashboard with parallax
│   ├── create-or-edit-template-plan-component/
│   ├── create-or-edit-workout-execution/
│   ├── list-template-plans/
│   ├── list-executed-workouts/
│   └── ...
├── core/
│   ├── services/               → 24 services (providedIn: 'root')
│   ├── guards/                 → 5 route guards
│   ├── interceptors/           → JWT auth interceptor
│   ├── pipes/                  → 5 custom pipes
│   └── handler/                → Global error handler
└── models/                     → 41 DTOs and TypeScript interfaces
```

---

## Run Locally

```bash
npm install
ng serve
```

The app runs with automatic mock data in development — no backend required.

---

## License

This project is personal and not open for contributions at this time.
