# Example Integration

## 1) Install

```bash
pnpm add -D page-preview
```

## 2) Add preview stories

Create one or more `*.preview.ts` files, for example:

- `src/dev/sign-up.preview.ts`

The runtime auto-discovers and merges all `*.preview.ts` files.

## 3) Create and register bridge

- `src/dev/preview-bridge.ts`
- `src/dev/register-preview-project-adapters.ts`

Register only the stores/clients you want to control from preview variants.

## 4) Apply preview state once on app startup

```ts
import { previewBridge } from "@/dev/preview-bridge";

if (typeof window !== "undefined") {
  previewBridge.applyFromSearch(window.location.search);
}
```

## 5) Run

```bash
pnpm page-preview
```

Open `http://127.0.0.1:4100`.
