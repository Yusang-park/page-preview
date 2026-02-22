# page-preview-lab

Storybook-like **page runtime preview** for full pages and hidden UI branches.

![Page Preview Gallery](./docs/screenshots/gallery.png)

## Why

Component story tools are great for isolated UI, but they do not always cover real page branching (auth gates, async states, seeded stores, deep paths). `page-preview-lab` runs a dedicated preview runtime on `:4100` and lets you define page variants as stories.

## Install

```bash
pnpm add -D page-preview-lab
```

## Zero-config discovery (`*.preview.ts`)

By default, `page-preview-lab` scans your project root and automatically merges every `*.preview.ts` file.

You can run without any stories argument:

```bash
page-preview dev
```

This means in app projects you can keep only one script:

```json
{
  "scripts": {
    "page-preview": "pnpm exec page-preview dev"
  }
}
```

Then run:

```bash
pnpm page-preview
```

## Story file format

```ts
import type { PagePreviewEntry } from "page-preview-lab/lib";

export const pagePreviewStories: PagePreviewEntry[] = [
  {
    id: "create-artist",
    group: "Sign in",
    name: "Create artist",
    title: "Create artist",
    description: "Artist onboarding states",
    target: {
      path: "/sign-up",
      variantQueryKey: "preview",
      stateQueryKey: "__pp",
    },
    variants: [
      {
        id: "create-artist",
        label: "Artist selected",
        state: {
          zustand: [{ storeId: "signup", state: { step: "instagram" } }],
          reactQuery: [{ queryKey: ["seed"], data: { ok: true } }],
        },
      },
      { id: "create-idle", label: "Idle" },
    ],
  },
];
```

## State plugin injection (Zustand / Redux / Context / React Query)

Use `createPreviewBridge` from the library and register your state containers once.

### 1) Create bridge instance

```ts
import { createPreviewBridge } from "page-preview-lab/lib";

export const previewBridge = createPreviewBridge({
  queryKey: "__pp", // default
  developmentOnly: true, // default
});
```

### 2) Register stores/clients

```ts
import { queryClient } from "@/lib/gql/query-client";
import { useSignUpStore } from "@/screens/auth/sign-up/sign-up-store";
import { previewBridge } from "./preview-bridge";

previewBridge.registerZustandStore("signup", useSignUpStore as unknown as { setState: (state: Record<string, unknown>) => void });
previewBridge.registerReactQueryClient("app", queryClient);

// Optional providers:
// previewBridge.registerReduxStore("app", reduxStore);
// previewBridge.registerContextSetter("my-context", setContextValue);
```

### 3) Apply snapshot from URL query once on app startup

```ts
import { previewBridge } from "@/dev/preview-bridge";

if (typeof window !== "undefined") {
  previewBridge.applyFromSearch(window.location.search);
}
```

### 4) Emit state from stories

`state` in each variant supports:

- `zustand: [{ storeId, state }]`
- `redux: [{ storeId, action }]`
- `context: [{ contextId, value }]`
- `reactQuery: [{ queryKey, data }]`

## Commands

```bash
page-preview dev
page-preview build
page-preview preview
page-preview e2e
```

Optional single-file mode (override auto discovery):

```bash
page-preview dev --stories next/dev/custom-stories.ts
```

## Examples

See `examples/universal-expo`.

## Local Development

```bash
pnpm install
pnpm dev
pnpm e2e
```
