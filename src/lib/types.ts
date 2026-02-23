export type PagePreviewVariant = {
  id: string;
  label: string;
  state?: PreviewStateSnapshot;
};

export type PagePreviewTarget = {
  path: string;
  origin?: string;
  variantQueryKey?: string;
  stateQueryKey?: string;
};

export type PagePreviewEntry = {
  id: string;
  group?: string;
  name?: string;
  title?: string;
  description?: string;
  target: PagePreviewTarget;
  variants: PagePreviewVariant[];
};

export type ZustandInjection = {
  storeId: string;
  state: Record<string, unknown>;
};

export type ReduxInjection = {
  storeId: string;
  action: unknown;
};

export type ContextInjection = {
  contextId: string;
  value: unknown;
};

export type ReactQueryInjection = {
  queryKey: unknown[];
  data: unknown;
};

export type PreviewStateSnapshot = {
  zustand?: ZustandInjection[];
  redux?: ReduxInjection[];
  context?: ContextInjection[];
  reactQuery?: ReactQueryInjection[];
  vars?: Record<string, unknown>;
};
