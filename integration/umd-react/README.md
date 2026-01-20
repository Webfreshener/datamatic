# Datamatic React (UMD) Example

This React app is powered by Vite and loads the Datamatic UMD browser build
from `public/datamatic.window.js`.

## Prerequisites

- Node.js 18+ and npm (or pnpm)

## Install

```bash
npm install
```

## Run

```bash
npm run dev
```

Open the printed local URL (default: `http://localhost:5173`) and click
**Run sample** to emit data through the pipeline.

## Build

```bash
npm run build
npm run preview
```

## Notes

- The Datamatic dependency is `file:../../` so it resolves to the local repo.
- If you change Datamatic and need a fresh UMD bundle, rebuild from the repo
  root and re-copy `dist/datamatic.window.js` to `public/datamatic.window.js`,
  then restart the dev server.
