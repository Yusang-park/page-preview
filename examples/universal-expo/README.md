# universal-expo Example

## 1) Install

```bash
pnpm add -D page-preview
```

## 2) Add stories

Create `src/dev/sign-up.preview.ts` (or any `*.preview.ts`) and export `pagePreviewStories`.

## 3) Register state adapters

Create `src/dev/register-preview-project-adapters.ts` and register your stores/clients.

## 4) Run

```bash
pnpm page-preview
```

Then open `http://127.0.0.1:4100`.
