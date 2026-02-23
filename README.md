# page-preview

Storybook-like **page runtime preview** for full pages and hidden UI branches.

![Page Preview Demo](./docs/screenshots/page-preview-demo.gif)

## Why

Component story tools are great for isolated UI, but they do not always cover real page branching (auth gates, async states, seeded stores, deep paths). `page-preview` runs a dedicated preview runtime on `:4100` and lets you define page variants as stories.

## Install

```bash
pnpm add -D page-preview
```

## Zero-config discovery (`*.preview.ts`)

By default, `page-preview` scans your project root and automatically merges every `*.preview.ts` file.

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
import type { PagePreviewEntry } from "page-preview/lib";

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

Use `createPreviewBridge` from the library and register your state containers.

### Core rule: register once per container

- Register each target store/client **once** during app startup.
- You do **not** need to register on every page or every variant.
- Register only containers you want to control from preview states.

### Core rule: `storeId` must match

If your variant contains:

```ts
zustand: [{ storeId: "signup", state: { step: "role" } }];
```

You must register a Zustand store with the same id:

```ts
previewBridge.registerZustandStore("signup", useSignUpStore);
```

If ids do not match, that state block is ignored.

### 1) Create bridge instance

```ts
import { createPreviewBridge } from "page-preview/lib";

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

previewBridge.registerZustandStore("signup", useSignUpStore);
previewBridge.registerReactQueryClient("app", queryClient);

// Optional providers:
// previewBridge.registerReduxStore("app", reduxStore);
// previewBridge.registerContextSetter("my-context", setContextValue);
```

Recommended place: a single module such as `src/dev/register-preview-project-adapters.ts` that is imported once from app bootstrap.

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

### Container mapping summary

- Zustand: `registerZustandStore("<id>", store)` ⇄ `state.zustand[].storeId`
- Redux: `registerReduxStore("<id>", store)` ⇄ `state.redux[].storeId`
- Context: `registerContextSetter("<id>", setter)` ⇄ `state.context[].contextId`
- React Query: any registered query client receives `state.reactQuery[]` via `setQueryData`

### Minimal wiring checklist

1. Create one bridge instance.
2. Register preview-target stores/clients once.
3. Call `applyFromSearch(window.location.search)` once at app startup.
4. Use matching ids in `*.preview.ts`.

## Isolated preview context (credentialless iframes)

All preview iframes use the HTML `credentialless` attribute by default. This means each iframe loads in an **anonymous, cookie-free context** — equivalent to an incognito window.

This solves a common pain point: previewing auth-gated pages (login, onboarding, sign-up flows) while already logged in. No per-story configuration needed.

> **Browser support:** Chrome 110+. Other browsers will silently ignore the attribute and fall back to the normal (cookie-sharing) behavior.

## `isPreview` — detect preview mode in your app

Import `isPreview` to conditionally bypass auth guards, skip redirects, or disable side effects when the page is loaded inside a page-preview iframe.

```ts
import { isPreview } from "page-preview/lib";

// Example: skip auth redirect in preview mode
if (isPreview) {
  // bypass ProtectedRoute, skip onboarding redirect, etc.
}
```

`isPreview` is `true` when the URL contains `preview` or `__pp` query parameters (which page-preview always appends to iframe URLs).

## `usePreviewState` — preview-aware `useState`

Drop-in replacement for React's `useState` that reads its initial value from preview variant state when running inside a page-preview iframe. In normal mode, it behaves exactly like `useState`.

```ts
import { usePreviewState } from "page-preview/lib";

// Normal mode: useState(0)
// Preview mode: reads from variant state.vars.currentStep
const [currentStep, setCurrentStep] = usePreviewState("currentStep", 0);
```

In your story file, use `state.vars` to set the initial value:

```ts
variants: [
  { id: "artists", label: "Artists", state: { vars: { currentStep: 0 } } },
  { id: "platforms", label: "Platforms", state: { vars: { currentStep: 1 } } },
  { id: "countries", label: "Countries", state: { vars: { currentStep: 2 } } },
  { id: "labels", label: "Labels", state: { vars: { currentStep: 3 } } },
]
```

This keeps page components free of preview-specific logic — just swap `useState` for `usePreviewState`.

## Examples

See `examples`.
