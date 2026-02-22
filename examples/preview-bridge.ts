import { createPreviewBridge } from "page-preview/lib";

export const previewBridge = createPreviewBridge({
  queryKey: "__pp",
  developmentOnly: true,
});
