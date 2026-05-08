/**
 * Sanitize Meilisearch highlight output.
 *
 * Meilisearch wraps matched terms in `<mark>...</mark>` (default config). Untuk
 * cegah DOM XSS dari stored data yang malicious, kita escape SEMUA HTML lalu
 * un-escape hanya `<mark>` tag (no attributes).
 *
 * Hasilnya safe utk dipakai di `dangerouslySetInnerHTML`.
 *
 * Approach: regex-based whitelist (zero dependency, deterministic, fast).
 *
 * Pattern allowed:
 *   - <mark>text</mark>
 *
 * Pattern stripped:
 *   - <script>, <iframe>, <img>, <a>, <svg>, dll → escaped
 *   - <mark style="...">, <mark onclick="...">, dll → attributes stripped
 *   - Event handlers (onclick, onerror, dll) → escaped
 */
export function sanitizeHighlight(input: unknown): string {
  if (input === null || input === undefined) return "";
  const str = String(input);
  if (!str) return "";

  // 1. Escape semua HTML special chars
  const escaped = str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

  // 2. Un-escape ONLY <mark> dan </mark> (no attributes allowed)
  return escaped
    .replace(/&lt;mark&gt;/g, "<mark>")
    .replace(/&lt;\/mark&gt;/g, "</mark>");
}

/**
 * Helper untuk membuat React `dangerouslySetInnerHTML` prop yang sudah
 * di-sanitize. Pakai pattern:
 *
 *   <span {...sanitizedHtml(highlight?.field)} />
 *
 * Kalau highlight kosong, fallback ke field plain (caller handle).
 */
export function sanitizedHtml(input: unknown): { dangerouslySetInnerHTML: { __html: string } } {
  return { dangerouslySetInnerHTML: { __html: sanitizeHighlight(input) } };
}
