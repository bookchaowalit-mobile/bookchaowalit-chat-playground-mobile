# Chat Playground — Mobile

React Native mobile app (Expo) for **Chat Playground**.

Part of [Chaowalit Greepoke](https://bookchaowalit.com)'s 101 Portfolio Projects.

## Tech Stack

- **Framework:** Expo SDK 53 + Expo Router
- **Language:** TypeScript
- **Navigation:** Expo Router (file-based)
- **UI:** React Native + Ionicons

## Features

- **Chat playground** (home tab): send messages and get replies from a local,
  deterministic mock assistant, so the app works fully offline and never
  sends data anywhere. Try `hello`, `/help`, `/reverse`, `/count`, `/upper`,
  `/tokens`.
- **System prompt / persona** field included in the conversation.
- **Token estimates** (~4 chars/token) for the draft and the whole
  conversation, a selectable plain-text **transcript** view, and Clear.
- Pure logic in `lib/chat.ts` (also includes `trimToBudget` for fitting a
  conversation into a context budget). Plugging in a real model API is on the
  backlog and must go through a server-side proxy, never an API key in the app.

## Getting Started

```bash
npm ci
npx expo start
```

## Validation

```bash
npm run validate   # expo lint + tsc --noEmit + vitest
npx expo export --platform android --output-dir dist   # bundle smoke check
```

Pure logic lives in `lib/` and is unit-tested with Vitest (`lib/*.test.ts`).
CI (`.github/workflows/build.yml`) runs all of the above and fails on errors;
the EAS preview build is owner-triggered (`workflow_dispatch`) and needs the
`EXPO_TOKEN` secret plus the committed `eas.json`.

## Build

```bash
# Android
npx eas build --platform android --profile preview

# iOS
npx eas build --platform ios --profile preview
```

## Related

- **Frontend:** [bookchaowalit-website/chat-playground-frontend](https://github.com/bookchaowalit-website/chat-playground-frontend)
- **Portfolio:** [bookchaowalit.com](https://bookchaowalit.com)

## License

MIT
