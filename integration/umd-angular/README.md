# Datamatic Angular (UMD) Example

This Angular app demonstrates how to consume the Datamatic UMD build through
standard Angular tooling. The dependency points to the repo root so you can
iterate on Datamatic locally.

## Prerequisites

- Node.js 18+ and npm (or pnpm)
- The repo root dependencies installed if you want to rebuild `dist/`

## Install

```bash
npm install
```

## Run

```bash
npm start
```

Open `http://localhost:4200` and click **Run sample** to send data through the
pipeline.

## Build

```bash
npm run build
```

## Notes

- The Datamatic dependency is `file:../../` so it resolves to the local repo.
- If you change Datamatic and need a fresh UMD bundle, rebuild from the repo
  root and restart the Angular dev server.
