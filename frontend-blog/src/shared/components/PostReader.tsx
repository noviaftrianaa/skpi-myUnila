interface Props {
  html: string;
}

// Simple HTML renderer untuk konten post (output TipTap).
// PERINGATAN: di production, sanitize HTML SERVER-SIDE sebelum simpan ke DB
// (DOMPurify di backend Go via wasm atau sanitize via library Go khusus).
// Tidak boleh trust HTML mentah dari user.
//
// Untuk demo/MVP frontend dengan mock data, kita assume HTML sudah aman.
//
// Mention + hashtag auto-link: scans the rendered HTML for `@subdomain` and
// `#hashtag` patterns and wraps each match in an anchor. Mentions point to
// the author's tenant home; hashtags point to the apex /search page.
// We avoid touching strings inside existing <a> tags, <code>, or <pre> so
// explicit links and code samples stay untouched.
export function PostReader({ html }: Props) {
  const linked = autolinkAll(html);
  return (
    <div
      className="prose prose-blog max-w-none [&_.mention]:text-myunila [&_.mention]:font-medium [&_.mention]:no-underline hover:[&_.mention]:underline [&_.hashtag]:text-blue-600 [&_.hashtag]:dark:text-blue-400 [&_.hashtag]:font-medium [&_.hashtag]:no-underline hover:[&_.hashtag]:underline"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: linked }}
    />
  );
}

const APEX_HOST = process.env.NEXT_PUBLIC_APEX_HOST || "blog.unila.ac.id";

// Matches @subdomain — same rules as backend extractMentions:
// 3–60 chars, lowercase alnum + hyphen, no leading/trailing hyphen, no `--`.
// Lookbehind requires start-of-string OR non-alnum/non-`.` before `@` so we
// don't auto-link the local-part of email addresses; negative lookahead skips
// `.tld` so `foo@bar.com` stays plain text.
const mentionRe = /(^|[^A-Za-z0-9._-])@([a-z0-9](?:[a-z0-9-]{1,58}[a-z0-9]))(?!\.[a-zA-Z])/g;

// Matches #hashtag — 2–40 chars, Unicode letters/digits/underscore. Requires
// start-of-string or whitespace/punctuation before `#` so CSS values like
// `color: #FF0000` and HTML fragment IDs don't trigger.
const hashtagRe = /(^|[\s>(.,;!?—–"'])#([\p{L}\p{N}_]{2,40})(?!\w)/gu;

// Skip strings inside <a ...>…</a> blocks (preserve explicit author links)
// and inside <code>/<pre> blocks (don't auto-link code samples).
const skipBlockRe = /<(a|code|pre)\b[^>]*>[\s\S]*?<\/\1>/gi;

function autolinkAll(html: string): string {
  if (!html) return html;
  if (!html.includes("@") && !html.includes("#")) return html;

  // Splice out skip-blocks first so we don't mutate inside them. We replace
  // each occurrence with a placeholder, run replacements on the outside,
  // then splice the originals back in.
  const skipped: string[] = [];
  const placeholderHTML = html.replace(skipBlockRe, (m) => {
    const idx = skipped.length;
    skipped.push(m);
    return ` SKIP${idx} `;
  });

  let linked = placeholderHTML.replace(mentionRe, (match, prefix: string, sub: string) => {
    if (sub.includes("--")) return match;
    const href = `https://${sub}.${APEX_HOST}`;
    return `${prefix}<a class="mention" href="${href}" rel="noopener">@${sub}</a>`;
  });

  linked = linked.replace(hashtagRe, (match, prefix: string, tag: string) => {
    // Skip pure-hex patterns (CSS color codes: #FF0000, #abc, #1a2b3c4d).
    if (/^[0-9A-Fa-f]{3}$/.test(tag) || /^[0-9A-Fa-f]{4}$/.test(tag) ||
        /^[0-9A-Fa-f]{6}$/.test(tag) || /^[0-9A-Fa-f]{8}$/.test(tag)) {
      return match;
    }
    const href = `https://${APEX_HOST}/search?q=${encodeURIComponent(tag)}`;
    return `${prefix}<a class="hashtag" href="${href}" rel="noopener">#${tag}</a>`;
  });

  return linked.replace(/ SKIP(\d+) /g, (_match, idxStr) => skipped[Number(idxStr)] ?? "");
}
