# universal-expo Example

## 1) Install

```bash
pnpm add -D page-preview-lab
```

## 2) Add stories

Create `next/dev/page-preview-stories.ts` and define `pagePreviewStories`.

## 3) Register state adapters

Create `next/dev/register-preview-project-adapters.ts` and register your stores/clients.

## 4) Run

```bash
page-preview dev --stories next/dev/page-preview-stories.ts
```

Then open `http://127.0.0.1:4100`.
