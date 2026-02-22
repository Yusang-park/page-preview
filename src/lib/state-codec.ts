import type { PreviewStateSnapshot } from "./types";

const toBase64Url = (value: string) =>
  btoa(unescape(encodeURIComponent(value)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

const fromBase64Url = (value: string) => {
  const padded = value + "===".slice((value.length + 3) % 4);
  const base64 = padded.replace(/-/g, "+").replace(/_/g, "/");
  return decodeURIComponent(escape(atob(base64)));
};

export const encodePreviewState = (snapshot: PreviewStateSnapshot) =>
  toBase64Url(JSON.stringify(snapshot));

export const decodePreviewState = (encoded: string): PreviewStateSnapshot | null => {
  try {
    const parsed = JSON.parse(fromBase64Url(encoded));
    if (!parsed || typeof parsed !== "object") return null;
    return parsed as PreviewStateSnapshot;
  } catch {
    return null;
  }
};
