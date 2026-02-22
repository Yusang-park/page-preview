import type { PagePreviewEntry, PagePreviewVariant } from "./types";

export const buildVariantViewerPath = (
  entry: Pick<PagePreviewEntry, "id">,
  variant: Pick<PagePreviewVariant, "id">,
) => `/preview/${entry.id}?variant=${variant.id}`;

export const buildVariantRenderPath = (
  entry: Pick<PagePreviewEntry, "id">,
  variant: Pick<PagePreviewVariant, "id">,
) => `/preview/render/${entry.id}/${variant.id}`;

export const findPagePreviewEntry = (
  entries: PagePreviewEntry[],
  pageId: string,
) => entries.find((entry) => entry.id === pageId);
