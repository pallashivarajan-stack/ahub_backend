/** Shared media URL helpers for frontend ↔ backend integration */

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000";

/** Public media path prefix — backend serves uploaded files here */
export const PUBLIC_MEDIA_PATH = "/api/public/media";

/** When true, `<img src>` uses API fetch URLs instead of bundled local URLs */
export const USE_API_MEDIA = import.meta.env.VITE_USE_API_MEDIA === "true";

/** Build full fetch URL for a relative asset path (e.g. `team/photo.jpg`) */
export function mediaFetchUrl(relativePath: string): string {
  const normalized = relativePath.replace(/^\/+/, "");
  return `${API_BASE_URL}${PUBLIC_MEDIA_PATH}/${normalized}`;
}

/**
 * Resolve any image path returned by the backend to a full HTTP URL.
 *
 * The backend upload endpoints return paths in these formats:
 *   - "api/public/media/mentors/abc.jpg"   (no leading slash — legacy format)
 *   - "/api/public/media/mentors/abc.jpg"  (with leading slash)
 *   - "http://localhost:8000/..."           (already full URL)
 *
 * All three cases are handled and return a full http:// URL that the browser
 * can use directly as an <img src>.
 */
export function resolveBackendMediaUrl(path: string | null | undefined): string {
  if (!path) return "";

  // Already a full URL (http or https)
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  // Already starts with the API base URL (shouldn't happen but guard anyway)
  if (path.startsWith(API_BASE_URL)) {
    return path;
  }

  // Strip any leading slash so we can always prepend API_BASE_URL + "/"
  const stripped = path.replace(/^\/+/, "");

  return `${API_BASE_URL}/${stripped}`;
}

/** Pick display URL: API fetch URL when enabled, otherwise local bundled URL */
export function resolveDisplayUrl(
  fetchRelativePath: string,
  localUrl: string,
): string {
  return USE_API_MEDIA ? mediaFetchUrl(fetchRelativePath) : localUrl;
}
