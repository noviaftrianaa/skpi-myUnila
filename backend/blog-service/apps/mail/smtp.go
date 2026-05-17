package mail

import (
	"context"
	"crypto/tls"
	"fmt"
	"net"
	"net/smtp"
	"strings"
	"time"
)

// =============================================================================
// SMTP CLIENT
//
// Thin wrapper over net/smtp that reads its config from the DB on each send
// (re-fetched per drain cycle). This keeps the admin's "Save & Activate"
// effective within ~60s without a process restart.
//
// Supported modes:
//   - Plaintext (port 1025 / Mailpit)        — no TLS, no auth
//   - STARTTLS (port 587, common Unila relay) — opportunistic TLS upgrade
//   - Implicit TLS (port 465)                 — TLS-from-start
//
// Auth is PLAIN when username+password are set. Empty username = anonymous.
// =============================================================================

const smtpDialTimeout = 10 * time.Second

type Sender struct {
	cfgRepo *ConfigRepository
}

func NewSender(cfgRepo *ConfigRepository) *Sender { return &Sender{cfgRepo: cfgRepo} }

// Send delivers one email using the currently-active mail_config. Returns
// ErrNoActiveConfig if SMTP isn't set up — caller (worker) treats this as a
// transient "skip and retry later", NOT a permanent failure.
func (s *Sender) Send(ctx context.Context, to, subject, bodyHTML, bodyText string) error {
	cfg, err := s.cfgRepo.GetActive(ctx)
	if err != nil {
		return err
	}
	if cfg.SMTPHost == "" || cfg.FromAddress == "" {
		return fmt.Errorf("mail config incomplete: host/from missing")
	}

	addr := fmt.Sprintf("%s:%d", cfg.SMTPHost, cfg.SMTPPort)
	dialer := &net.Dialer{Timeout: smtpDialTimeout}
	conn, err := dialer.DialContext(ctx, "tcp", addr)
	if err != nil {
		return fmt.Errorf("dial smtp: %w", err)
	}

	// Implicit TLS (port 465 convention).
	if cfg.UseTLS && !cfg.UseSTARTTLS {
		tlsConn := tls.Client(conn, &tls.Config{ServerName: cfg.SMTPHost})
		if err := tlsConn.HandshakeContext(ctx); err != nil {
			_ = conn.Close()
			return fmt.Errorf("tls handshake: %w", err)
		}
		conn = tlsConn
	}

	c, err := smtp.NewClient(conn, cfg.SMTPHost)
	if err != nil {
		_ = conn.Close()
		return fmt.Errorf("smtp client: %w", err)
	}
	defer func() { _ = c.Quit() }()

	if err := c.Hello("blog.unila.ac.id"); err != nil {
		return fmt.Errorf("ehlo: %w", err)
	}

	// STARTTLS upgrade (port 587 convention).
	if cfg.UseSTARTTLS {
		if ok, _ := c.Extension("STARTTLS"); ok {
			if err := c.StartTLS(&tls.Config{ServerName: cfg.SMTPHost}); err != nil {
				return fmt.Errorf("starttls: %w", err)
			}
		}
	}

	// PLAIN auth when credentials present. Anonymous (Mailpit default) skips.
	if cfg.SMTPUsername != nil && *cfg.SMTPUsername != "" {
		var pass string
		if cfg.SMTPPassword != nil {
			pass = *cfg.SMTPPassword
		}
		auth := smtp.PlainAuth("", *cfg.SMTPUsername, pass, cfg.SMTPHost)
		if err := c.Auth(auth); err != nil {
			return fmt.Errorf("smtp auth: %w", err)
		}
	}

	if err := c.Mail(cfg.FromAddress); err != nil {
		return fmt.Errorf("MAIL FROM: %w", err)
	}
	if err := c.Rcpt(to); err != nil {
		return fmt.Errorf("RCPT TO %s: %w", to, err)
	}
	w, err := c.Data()
	if err != nil {
		return fmt.Errorf("DATA: %w", err)
	}

	msg := buildMIMEMessage(MIMEFields{
		FromAddress: cfg.FromAddress,
		FromName:    cfg.FromName,
		ToAddress:   to,
		Subject:     subject,
		HTMLBody:    bodyHTML,
		TextBody:    bodyText,
	})
	if _, err := w.Write([]byte(msg)); err != nil {
		return fmt.Errorf("write DATA: %w", err)
	}
	if err := w.Close(); err != nil {
		return fmt.Errorf("close DATA: %w", err)
	}
	return nil
}

// MIMEFields — inputs to the multipart message builder.
type MIMEFields struct {
	FromAddress string
	FromName    string
	ToAddress   string
	Subject     string
	HTMLBody    string
	TextBody    string
}

// buildMIMEMessage builds a multipart/alternative message — text/plain first
// for fallback clients, then text/html for modern ones.
func buildMIMEMessage(f MIMEFields) string {
	boundary := "myunila-mail-" + randHex(12)
	from := f.FromAddress
	if f.FromName != "" {
		from = fmt.Sprintf("%s <%s>", quoteIfNeeded(f.FromName), f.FromAddress)
	}
	plain := f.TextBody
	if plain == "" {
		plain = stripBasicHTML(f.HTMLBody)
	}

	headers := []string{
		"From: " + from,
		"To: " + f.ToAddress,
		"Subject: " + encodeMIMEHeader(f.Subject),
		"Date: " + time.Now().UTC().Format(time.RFC1123Z),
		"MIME-Version: 1.0",
		`Content-Type: multipart/alternative; boundary="` + boundary + `"`,
	}

	var b strings.Builder
	for _, h := range headers {
		b.WriteString(h)
		b.WriteString("\r\n")
	}
	b.WriteString("\r\n")
	// Plain text part
	b.WriteString("--")
	b.WriteString(boundary)
	b.WriteString("\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: 8bit\r\n\r\n")
	b.WriteString(plain)
	b.WriteString("\r\n\r\n")
	// HTML part
	b.WriteString("--")
	b.WriteString(boundary)
	b.WriteString("\r\nContent-Type: text/html; charset=UTF-8\r\nContent-Transfer-Encoding: 8bit\r\n\r\n")
	b.WriteString(f.HTMLBody)
	b.WriteString("\r\n\r\n--")
	b.WriteString(boundary)
	b.WriteString("--\r\n")
	return b.String()
}

// encodeMIMEHeader applies a minimal RFC 2047 encoding for non-ASCII subjects.
// Falls back to plain UTF-8 when ASCII-only.
func encodeMIMEHeader(s string) string {
	for _, r := range s {
		if r > 127 {
			// Switch to base64 encoded-word per RFC 2047.
			return mimeEncodeBase64(s)
		}
	}
	return s
}

func mimeEncodeBase64(s string) string {
	// Avoid stdlib mime.QEncoding overhead — inline simple base64.
	return "=?UTF-8?B?" + base64Std(s) + "?="
}

func base64Std(s string) string {
	const t = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
	b := []byte(s)
	var out strings.Builder
	for i := 0; i < len(b); i += 3 {
		var n uint32
		switch len(b) - i {
		case 1:
			n = uint32(b[i]) << 16
			out.WriteByte(t[(n>>18)&0x3f])
			out.WriteByte(t[(n>>12)&0x3f])
			out.WriteString("==")
			return out.String()
		case 2:
			n = uint32(b[i])<<16 | uint32(b[i+1])<<8
			out.WriteByte(t[(n>>18)&0x3f])
			out.WriteByte(t[(n>>12)&0x3f])
			out.WriteByte(t[(n>>6)&0x3f])
			out.WriteString("=")
			return out.String()
		default:
			n = uint32(b[i])<<16 | uint32(b[i+1])<<8 | uint32(b[i+2])
			out.WriteByte(t[(n>>18)&0x3f])
			out.WriteByte(t[(n>>12)&0x3f])
			out.WriteByte(t[(n>>6)&0x3f])
			out.WriteByte(t[n&0x3f])
		}
	}
	return out.String()
}

// quoteIfNeeded wraps a display name in quotes if it contains characters
// (commas, parens, etc.) that need quoting in an RFC 5322 address.
func quoteIfNeeded(s string) string {
	for _, c := range s {
		if c == ',' || c == '(' || c == ')' || c == ':' || c == ';' || c == '<' || c == '>' || c == '@' {
			return `"` + strings.ReplaceAll(s, `"`, `\"`) + `"`
		}
	}
	return s
}

// stripBasicHTML — minimal HTML→text. Just enough for the text/plain fallback
// when caller didn't supply one.
func stripBasicHTML(html string) string {
	out := html
	out = strings.ReplaceAll(out, "<br>", "\n")
	out = strings.ReplaceAll(out, "<br/>", "\n")
	out = strings.ReplaceAll(out, "<br />", "\n")
	out = strings.ReplaceAll(out, "</p>", "\n\n")
	out = strings.ReplaceAll(out, "</h1>", "\n\n")
	out = strings.ReplaceAll(out, "</h2>", "\n\n")
	out = strings.ReplaceAll(out, "</li>", "\n")
	// Strip remaining tags
	for {
		start := strings.Index(out, "<")
		if start < 0 {
			break
		}
		end := strings.Index(out[start:], ">")
		if end < 0 {
			break
		}
		out = out[:start] + out[start+end+1:]
	}
	out = strings.TrimSpace(out)
	return out
}

func randHex(n int) string {
	const t = "0123456789abcdef"
	b := make([]byte, n)
	now := time.Now().UnixNano()
	for i := range b {
		b[i] = t[(now>>(uint(i)*4))&0xf]
	}
	return string(b)
}
