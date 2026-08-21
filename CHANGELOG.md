# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2026-08-20

### Added
- Helper convenience functions: `toast.success()`, `toast.error()`, `toast.warning()`, `toast.info()`, and `toast.loading()`.
- Built-in `toast.promise()` handler to automatically manage async workflows across loading, success, and error states.
- Global `toast.dismiss()` method to dismiss toasts from outside React components.
- `showProgress?: boolean` prop in `ToastOptions` to manually toggle progress bar visibility.
- `icon?: React.ReactNode` prop for custom icon overrides.
- Pause-on-hover interaction that freezes the countdown timer and progress bar animation.
- Dynamic ARIA live attributes (`role="alert"` / `role="status"`) for accessibility.

### Fixed
- Replaced sequential counter IDs with collision-proof UUIDs to resolve duplicate key errors during Next.js / Turbopack Fast Refresh.
- Refactored timer logic to eliminate React 19 compiler warnings regarding synchronous `setState` in effects.
- Removed impure `Date.now()` declarations during render.

### Changed
- Refactored TypeScript definitions: replaced all `:any` types with `LucideIcon | null` and `unknown` for strict type safety.

---

## [1.0.0] - 2026-08-01
- Initial release with basic toast functionality, duplication stacking, and variant styling.