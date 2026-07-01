# Implementation Plan - Simple UI Refactor & Light/Dark Theme

Implement a clean, simple layout using only the components in `src/components/ui` and semantic color classes mapped to `src/index.css`, and integrate a light/dark theme switch.

## User Review Required
> [!IMPORTANT]
> - The theme toggle will be added to the avatar dropdown in the Dashboard and a button in `AuthLayout.tsx`.
> - The `#root` element will be updated to be full width in `index.css` to fix the narrow column rendering.

## Proposed Changes

### Theme System
#### [NEW] [ThemeContext.tsx](file:///e:/WORKSPACE/PROJECT_WEB/viechat/viechat-ui/src/context/ThemeContext.tsx)
- Expose `theme` ('light' | 'dark') and `toggleTheme()` via a context provider.
- Toggle the `.dark` class on the `<html>` root and persist selection in `localStorage`.

#### [MODIFY] [App.tsx](file:///e:/WORKSPACE/PROJECT_WEB/viechat/viechat-ui/src/App.tsx)
- Wrap the application tree inside the new `ThemeProvider`.

---

### Core Styles
#### [MODIFY] [index.css](file:///e:/WORKSPACE/PROJECT_WEB/viechat/viechat-ui/src/index.css)
- Change media query `@media (prefers-color-scheme: dark)` to `.dark` class variables to sync custom vars with Tailwind.
- Set `#root` to `width: 100%` to make the workspace full-screen.

---

### UI Components
#### [MODIFY] [AuthLayout.tsx](file:///e:/WORKSPACE/PROJECT_WEB/viechat/viechat-ui/src/layouts/AuthLayout.tsx)
- Add a theme toggle button in the top-right corner using `useTheme`.

#### [MODIFY] [Sidebar.tsx](file:///e:/WORKSPACE/PROJECT_WEB/viechat/viechat-ui/src/containers/Dashboard/Sidebar.tsx)
- Inject `useTheme()` and add a "Light/Dark Mode" toggle item with Sun/Moon icons in the user profile dropdown.
- Update any hardcoded color classes to semantic tokens (`bg-background`, `border-border`, etc.).

#### [MODIFY] [ChatWindow.tsx](file:///e:/WORKSPACE/PROJECT_WEB/viechat/viechat-ui/src/containers/Dashboard/ChatWindow.tsx) & [ChatInfo.tsx](file:///e:/WORKSPACE/PROJECT_WEB/viechat/viechat-ui/src/containers/Dashboard/ChatInfo.tsx)
- Clean up any remaining hardcoded hex background/border classes to match the standard palette in `index.css`.

---

## Verification Plan
### Automated Tests
- Run `npx tsc -b --noEmit` to verify type safety.

### Manual Verification
- Toggle between light and dark mode and check that colors render correctly.
