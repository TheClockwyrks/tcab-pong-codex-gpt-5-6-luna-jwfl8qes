# Carom

Carom is a fast top-down paddle duel about bank shots and spin. Rally a bright
ball between two paddles, bend its flight with paddle motion, and use the two
amber obstacles to send shots somewhere your opponent cannot reach. First to
11 points with a two-point lead wins.

## Install and run

```sh
npm ci
npm run dev
```

Open the local Vite URL in a browser. To produce the static production site:

```sh
npm run build
npm run preview
```

The finished files are emitted to `dist/` and can be served from the root of
any static file server. No network service, credentials, art files, or audio
files are needed at runtime.

## Controls

- Solo: `W` / `S` move your left paddle. The right paddle is computer-controlled.
- Versus: `W` / `S` move player one; `↑` / `↓` move player two.
- `Enter` or `Space` confirms menu choices.
- `P` or `Escape` pauses and resumes a match; `M` toggles sound.

The menus also support pointer and touch selection. Moving a paddle as it makes
contact adds spin: downward motion curves the ball clockwise and upward motion
curves it counter-clockwise.

## Checks

```sh
npm run typecheck
npm run lint
npm run format
npm test
```
