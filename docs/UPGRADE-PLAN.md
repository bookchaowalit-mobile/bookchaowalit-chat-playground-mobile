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

## Done in this pass (pass 2)

Score: 7/10 (was 6/10) — conversation and system prompt survive restarts; still a local mock (no gateway).

- Conversation (last 200 messages, `recentMessages`) and system prompt persist via AsyncStorage (`@react-native-async-storage/async-storage` 2.1.2) through `lib/usePersistentState.ts` with a versioned codec; `isMessage` drops malformed entries (tested). "Clear" wipes the stored copy too.
- Accessibility: Transcript toggle and Clear have labels and disabled state; profile links get link roles.
- Advisories: `overrides.postcss ^8.5.28` clears the high-severity PostCSS advisory in Expo metro-config (minor bump). Remaining `image-size` (metro, bundler-only), `uuid` (via `xcode`) and `decode-uri-component` (via `query-string@7`) need an Expo SDK major upgrade; deliberately not auto-fixed.
- Verified: typecheck, lint, 17 vitest tests, Android `expo export` bundle.
