# page-preview-lab

Storybook-like **page runtime preview** for full pages and hidden UI branches.

![Page Preview Gallery](./docs/screenshots/gallery.png)

## Why

Component story tools are great for isolated UI, but they do not always cover real page branching (auth gates, async states, seeded stores, deep paths). `page-preview-lab` runs a dedicated preview runtime on `:4100` and lets you define page variants as stories.

## Install

```bash
pnpm add -D page-preview-lab
```

## Quick Start

1. Create a stories file in your app (example: `next/dev/page-preview-stories.ts`)
2. Define page entries + variants.
3. Run preview runtime.

```bash
page-preview dev --stories next/dev/page-preview-stories.ts
```

Open `http://127.0.0.1:4100`.

## Story Format

```ts
import type { PagePreviewEntry } from "page-preview-lab/lib";

export const pagePreviewStories: PagePreviewEntry[] = [
  {
    id: "create-artist",
    group: "Sign in",
    name: "Create artist",
    target: {
      path: "/sign-up",
      variantQueryKey: "preview",
      stateQueryKey: "__pp",
    },
    variants: [
      {
        id: "create-artist",
        label: "devPageGallery.variants.createIdle",
        state: {
          zustand: [{ storeId: "signup", state: { step: "instagram" } }],
          reactQuery: [{ queryKey: ["seed"], data: { ok: true } }],
        },
      },
      { id: "create-idle", label: "devPageGallery.variants.createIdle" },
    ],
  },
];
```

## Commands

```bash
page-preview dev --stories path/to/page-preview-stories.ts
page-preview build --stories path/to/page-preview-stories.ts
page-preview preview --stories path/to/page-preview-stories.ts
page-preview e2e
```

## Examples

See `examples/universal-expo`.

## Local Development

```bash
pnpm install
pnpm dev
pnpm e2e
```
