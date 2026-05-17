package mail

import (
	"fmt"
	"html"
	"strings"
)

// =============================================================================
// EMAIL TEMPLATES
//
// One renderer per notif tipe. We don't use html/template here — the input
// strings come from trusted server side (notif fields built from DB rows
// already-sanitised), and the layout is small enough that string formatting
// is clearer than templating. Each renderer returns (subject, html, plain).
//
// Brand wrapper: every email goes through wrapEmailHTML which adds the Unila
// header, body container, and footer with unsubscribe link.
// =============================================================================

// TemplateInput — values available to all template renderers.
type TemplateInput struct {
	Tipe       string
	AktorNama  string  // who triggered the notif (e.g. "Bambang Surya")
	JudulRef   string  // post/series/blog title context
	URLTarget  string  // relative path on /dashboard or blog
	PublicURL  string  // mail_config.public_url ("https://blog.unila.ac.id")
	Recipient  string  // for "Hi, {recipient}" salutation; can be empty
}

// Render returns (subject, htmlBody, plainBody) for the given input. Subjects
// are short and scannable in an inbox preview pane.
func Render(in TemplateInput) (subject, htmlBody, plainBody string) {
	actor := html.EscapeString(in.AktorNama)
	if actor == "" {
		actor = "Seseorang"
	}
	judul := html.EscapeString(in.JudulRef)
	dashURL := buildDashboardURL(in.URLTarget, in.PublicURL)

	switch in.Tipe {
	case "like_post":
		subject = fmt.Sprintf("❤️ %s menyukai post kamu", actor)
		htmlBody = fmt.Sprintf(`<p><strong>%s</strong> baru saja menyukai post kamu.</p>
<p style="color:#475569">📝 %s</p>`, actor, judul)
	case "komentar_post":
		subject = fmt.Sprintf("💬 %s berkomentar di post kamu", actor)
		htmlBody = fmt.Sprintf(`<p><strong>%s</strong> mengirim komentar baru di post kamu.</p>
<p style="color:#475569">📝 %s</p>`, actor, judul)
	case "reply_komentar":
		subject = fmt.Sprintf("↩️ %s membalas komentar kamu", actor)
		htmlBody = fmt.Sprintf(`<p><strong>%s</strong> membalas komentar kamu.</p>
<p style="color:#475569">📝 %s</p>`, actor, judul)
	case "follow_blog":
		subject = fmt.Sprintf("✨ %s mulai mengikuti blog kamu", actor)
		htmlBody = fmt.Sprintf(`<p><strong>%s</strong> mulai mengikuti blog kamu.</p>
<p style="color:#475569">Mereka akan dapat notifikasi saat kamu publish post baru.</p>`, actor)
	case "new_post_from_following":
		subject = fmt.Sprintf("📰 %s menerbitkan post baru", actor)
		htmlBody = fmt.Sprintf(`<p><strong>%s</strong> baru saja menerbitkan post baru.</p>
<p style="color:#475569">📝 %s</p>`, actor, judul)
	case "mention_komentar":
		subject = fmt.Sprintf("📣 %s menyebut kamu di komentar", actor)
		htmlBody = fmt.Sprintf(`<p><strong>%s</strong> menyebut kamu di sebuah komentar.</p>
<p style="color:#475569">📝 %s</p>`, actor, judul)
	case "mention_post":
		subject = fmt.Sprintf("📣 %s menyebut kamu di post", actor)
		htmlBody = fmt.Sprintf(`<p><strong>%s</strong> menyebut kamu di isi post mereka.</p>
<p style="color:#475569">📝 %s</p>`, actor, judul)
	case "coauthor_invite":
		subject = fmt.Sprintf("✉️ Undangan co-author dari %s", actor)
		htmlBody = fmt.Sprintf(`<p><strong>%s</strong> mengundang kamu sebagai co-author.</p>
<p style="color:#475569">📝 %s</p>
<p>Klik tombol di bawah untuk menerima atau menolak undangan.</p>`, actor, judul)
	case "coauthor_responded":
		subject = fmt.Sprintf("✉️ %s merespon undangan co-author kamu", actor)
		htmlBody = fmt.Sprintf(`<p><strong>%s</strong> sudah merespon undangan co-author kamu.</p>
<p style="color:#475569">📝 %s</p>`, actor, judul)
	default:
		subject = "Notifikasi baru di Blog Unila"
		htmlBody = fmt.Sprintf(`<p>Kamu punya notifikasi baru: %s</p>`, html.EscapeString(in.Tipe))
	}

	htmlBody = wrapEmailHTML(subject, htmlBody, dashURL, in.PublicURL)

	plainBody = fmt.Sprintf("%s\n\nBuka dashboard: %s\n\n--\nKamu menerima email ini karena ada aktivitas baru di Blog Unila.\nKelola preferensi notifikasi: %s/dashboard/blog-platform/notifications",
		stripBasicHTML(strings.Split(htmlBody, "<!-- main -->")[1]),
		dashURL, in.PublicURL)

	return subject, htmlBody, plainBody
}

// buildDashboardURL turns a relative path from the notif into an absolute URL
// the email recipient can click. Falls back to /dashboard root when target
// is empty.
func buildDashboardURL(target, publicURL string) string {
	base := strings.TrimRight(publicURL, "/")
	if target == "" {
		return base + "/dashboard/blog-platform"
	}
	// Existing notif URLs are relative to dashboard (start with "/dashboard/...").
	if strings.HasPrefix(target, "/") {
		return base + target
	}
	return base + "/dashboard/blog-platform/" + target
}

// wrapEmailHTML — Unila-branded shell. Wraps the per-tipe body fragment
// between a header banner and a footer with unsubscribe link + small print.
// Kept simple (table-based for legacy clients, inline styles) on purpose.
func wrapEmailHTML(preheader, body, dashURL, publicURL string) string {
	preheader = html.EscapeString(preheader)
	unsubURL := strings.TrimRight(publicURL, "/") + "/dashboard/blog-platform/notifications"
	return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Blog Unila</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#0f172a;">
<span style="display:none;opacity:0;visibility:hidden;height:0;width:0;font-size:0;">` + preheader + `</span>
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f1f5f9;padding:24px 0;">
  <tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,0.04);overflow:hidden;">
      <tr><td style="background:linear-gradient(135deg,#0B5EA8,#082F54);padding:24px 32px;color:#ffffff;">
        <div style="font-size:11px;letter-spacing:1.5px;text-transform:uppercase;opacity:0.8;">Universitas Lampung</div>
        <div style="font-size:20px;font-weight:bold;margin-top:4px;">Blog Unila</div>
      </td></tr>
      <tr><td style="padding:32px;font-size:15px;line-height:1.6;">
<!-- main -->` + body + `<!-- main -->
        <div style="margin-top:24px;text-align:center;">
          <a href="` + dashURL + `" style="background:#0B5EA8;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;display:inline-block;">Buka Dashboard →</a>
        </div>
      </td></tr>
      <tr><td style="background:#f8fafc;padding:20px 32px;border-top:1px solid #e2e8f0;font-size:11px;color:#64748b;text-align:center;">
        <p style="margin:0 0 8px 0;">Kamu menerima email ini karena ada aktivitas baru di Blog Unila.</p>
        <p style="margin:0;">
          <a href="` + unsubURL + `" style="color:#0B5EA8;text-decoration:underline;">Kelola preferensi notifikasi</a>
          &nbsp;·&nbsp;
          <a href="` + strings.TrimRight(publicURL, "/") + `" style="color:#0B5EA8;text-decoration:underline;">blog.unila.ac.id</a>
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`
}
