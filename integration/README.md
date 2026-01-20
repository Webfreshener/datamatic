# Integration Examples

This folder contains runnable examples that show how to integrate Datamatic
across different module formats and frameworks. Each example is self-contained
and wired to the local repo via `file:../../` so you can iterate on Datamatic
without publishing a package.

## Quick Start

```bash
cd integration/umd-react
npm install
npm run dev
```

Then open the printed local URL (default: `http://localhost:5173`).

## Examples

### `commonjs-node`
A minimal Node.js script that imports Datamatic via CommonJS.

```bash
cd integration/commonjs-node
npm install
node index.js
```

### `window-html`
A browser-only demo that loads the window build directly.

```bash
open integration/window-html/index.html
```

This example uses `dist/datamatic.window.js` from the repo root and exposes the
API on `window.datamatic`.

### `umd-react`
A React + Vite example that loads the Datamatic UMD browser build from
`public/datamatic.window.js`.

```bash
cd integration/umd-react
npm install
npm run dev
```

- Open the local URL (default: `http://localhost:5173`).
- Click **Run sample** to emit data through a pipeline and render the output.
If you rebuild Datamatic, re-copy `dist/datamatic.window.js` into
`integration/umd-react/public/datamatic.window.js`.

### `umd-angular`
An Angular example that imports Datamatic (UMD) from the local repo.

```bash
cd integration/umd-angular
npm install
npm start
```

- Open `http://localhost:4200`.
- Click **Run sample** to emit data through a pipeline and render the output.

## How local linking works

Each example depends on Datamatic via:

```
"datamatic": "file:../../"
```

That means installs resolve to the local repo and pick up changes without a
publish step. If you update Datamatic and need a fresh bundle, rebuild from the
repo root and restart the example dev server.

## Troubleshooting

- **Install fails**: Ensure Node.js 18+ is installed and remove any old
  `node_modules` before reinstalling.
- **Datamatic changes not picked up**: Rebuild the repo root bundle and restart
  the example app.
- **Port already in use**: Stop the previous dev server or change ports in the
  example's config (`umd-react/vite.config.js`, `umd-angular/angular.json`).
