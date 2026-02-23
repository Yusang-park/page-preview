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

/**
 * Returns `true` when the current page is loaded inside a page-preview iframe.
 *
 * Detection: checks for the presence of the `preview` or `__pp` query parameter
 * in the current URL. page-preview always appends at least one of these when
 * building iframe URLs.
 *
 * Usage in your app:
 * ```ts
 * import { isPreview } from "page-preview/lib";
 *
 * if (isPreview) {
 *   // skip auth guards, bypass redirects, etc.
 * }
 * ```
 */
export const isPreview: boolean =
  typeof window !== "undefined" &&
  (() => {
    const params = new URLSearchParams(window.location.search);
    return params.has("preview") || params.has("__pp");
  })();
