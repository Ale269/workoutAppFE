# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start                # Dev server on port 4202
npm run build            # Production build (generates app-info first)
npm test                 # Karma + Jasmine tests
npm run lint             # Linting
```

## Architecture

Angular 20 standalone components app (no NgModules). PWA-enabled fitness/workout tracker.

**Language**: Italian (UI, variable names, comments). Default i18n via @ngx-translate (`it`).

### Project Structure

- `src/app/core/` — Services, guards, interceptors, pipes (all `providedIn: 'root'`)
- `src/app/components/shared/` — Reusable UI components (modal, bottom-sheet, bottom-menu, spinner, etc.)
- `src/app/components/` — Feature/page components
- `src/app/models/` — DTOs and interfaces
- `src/styles.scss` — Global styles, theme variables, shared CSS classes

### Key Patterns

**Component files**: `name.ts`, `name.html`, `name.scss` (no `.component` suffix)

**State management**: Angular Signals for UI services (modal, spinner, bottom-sheet, bottom-menu, focus-overlay). BehaviorSubjects for auth/theme.

**Page layout**: Every page wraps content in `<div class="page-scroller">`. This container is `position: absolute; height: 100vh; overflow-y: auto` with padding-top for the header (116px) and padding-bottom for the bottom menu via CSS variable.

**Bottom menu coordination**: `BottomMenuService` sets `--bottom-menu-offset` CSS variable on `document.documentElement`. Floating button containers (`.floating-static-button-container`, `.floating-double-buttons-container`) use `bottom: var(--bottom-menu-offset, 0px)` with transition. A `MutationObserver` watches for `.page-scroller` DOM changes to re-attach scroll listeners (handles `@if` conditional rendering).

**Floating buttons**: Use global classes `.floating-static-button-container` or `.floating-double-buttons-container` with `position: fixed; bottom: var(--bottom-menu-offset, 0px)`.

**Overlay system**: Three layers managed by services in `app.component.html`:
1. `ModalService` (Signal-based, GSAP animations)
2. `BottomSheetService` (Signal-based, GSAP Draggable for swipe-to-close)
3. `FocusOverlayService` (Signal-based, dynamic component injection)

Body gets `.no-scroll` class when any overlay is active.

**Icons**: SVG icons in `assets/recollect/svg/`, registered via `MatIconRegistry.addSvgIcon()` in component constructors. Use `fill="currentColor"` in SVGs to inherit CSS color.

**Animations**: GSAP for complex sequences (page transitions, modal open/close, multi-option button expand). CSS transitions for simple show/hide (bottom menu slide).

**Page transitions**: `AnimationService` fades out on `GuardsCheckEnd`, fades in on `NavigationEnd` (0.3s each).

**API calls**: No hardcoded URLs. `ApiCatalogService` loads endpoints from `assets/recollect/env/{env}/apicatalog/api.json` at startup via `APP_INITIALIZER`.

**Auth**: JWT tokens in localStorage. `AuthInterceptor` (functional) adds Bearer header, auto-refreshes on 401. Guards: `AuthGuard`, `NoAuthGuard`, `AdminGuard`, `PendingChangesGuard`.

### Multi-Option Button

`MultiOptionButton` component expands to show option groups with GSAP timeline animation. Uses a transparent overlay to capture outside clicks for closing. Scroll does NOT close it — only overlay click/touch does.

### iOS Considerations

Bottom menu scroll handler ignores `scrollTop <= 0` and `scrollTop >= maxScroll` to prevent flickering from iOS rubber-band bounce effect.

## Environments

Build configs in `angular.json`: `production`, `development`, `docker`, `svil`, `test`. Each swaps `environment.ts` file.

## Design System

Dark theme, glassmorphism (`backdrop-filter: blur`, gradient borders). Accent color: `#00ffe1`. Font: Poppins. Global CSS classes in `styles.scss` for buttons, typography, sections, chips.
