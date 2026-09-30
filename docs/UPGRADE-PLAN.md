# Upgrade Plan

## Current state

- Before this pass: **2/10** — Expo template scaffold with placeholder
  screens; CI masked every failure with `|| true`; lint failed; the app could
  not be bundled (missing `expo-asset`, `query-string`, outdated
  `expo-router`); `app.json` referenced icon files that do not exist.
- After this pass: **6/10** — real core feature, tested pure logic,
  honest CI, app bundles for Android.

## Backlog

### P0
- Persist user data locally (AsyncStorage via `npx expo install
  @react-native-async-storage/async-storage`) where the feature holds state.
- Add real app icons (`assets/icon.png`, `assets/adaptive-icon.png`) and
  reference them from `app.json` before any store build.

### P1
- Add component tests (jest-expo + @testing-library/react-native) for the
  main screen.
- Dark-mode palette (`userInterfaceStyle` is `automatic` but colors are
  hard-coded light).

### P2
- Sync with the web frontend's API once one exists.
- Upgrade Expo SDK (clears remaining `npm audit` findings in Expo tooling).

## Done in this pass

- Home tab is an offline chat playground (system prompt, deterministic mock assistant with commands, token estimates, transcript view, clear).
- Pure logic in `lib/` with Vitest unit tests (`npm test`).
- CI now runs `npm ci`, lint, typecheck, tests and an Android bundle export
  with no failure masking; EAS preview build is owner-triggered only and
  `eas.json` is committed.
- Added `eslint.config.js`, `typecheck`/`test`/`validate` scripts and a
  committed `package-lock.json`.
- Fixed dependencies so Metro can bundle (SDK 53-aligned `expo-router`,
  `react-native`, `expo-constants`; added `expo-asset`, `expo-font`,
  `query-string`).
- `app.json`: removed references to missing icon files; Android package id
  no longer contains hyphens (invalid for Android application IDs).
- Removed the placeholder Explore tab.
