/**
 * Mail Config Service — admin-managed SMTP profile + outbox diagnostics.
 * Dynamic config: live row in blog.mail_config drives email delivery.
 */
import { blogClient, type APIEnvelope } from "./blogClient";

export interface MailConfig {
  id_mail_config: string;
  label: string;
  smtp_host: string;
  smtp_port: number;
  smtp_username?: string | null;
  use_tls: boolean;
  use_starttls: boolean;
  from_address: string;
  from_name: string;
  public_url: string;
  a_aktif: boolean;
  catatan?: string | null;
  has_password: boolean;
  created_at: string;
  updated_at: string;
}

export interface MailConfigInput {
  label: string;
  smtp_host: string;
  smtp_port: number;
  smtp_username?: string | null;
  /** On update: null = leave alone, "" = clear, "value" = replace. */
  smtp_password?: string | null;
  use_tls: boolean;
  use_starttls: boolean;
  from_address: string;
  from_name: string;
  public_url: string;
  catatan?: string | null;
}

export interface OutboxStats {
  pending: number;
  sending: number;
  sent: number;
  failed: number;
}

export interface EmailOutboxEntry {
  id_email: string;
  recipient_email: string;
  subject: string;
  tipe: string;
  status: "pending" | "sending" | "sent" | "failed";
  attempts: number;
  next_attempt_at: string;
  sent_at?: string | null;
  last_error?: string | null;
  created_at: string;
}

export const adminMailService = {
  async list(): Promise<MailConfig[]> {
    const { data } = await blogClient.get<APIEnvelope<MailConfig[]>>("/admin/mail-config/");
    return data.data;
  },

  async create(input: MailConfigInput): Promise<MailConfig> {
    const { data } = await blogClient.post<APIEnvelope<MailConfig>>("/admin/mail-config/", input);
    return data.data;
  },

  async update(id: string, input: MailConfigInput): Promise<MailConfig> {
    const { data } = await blogClient.put<APIEnvelope<MailConfig>>(`/admin/mail-config/${id}`, input);
    return data.data;
  },

  async activate(id: string): Promise<void> {
    await blogClient.patch(`/admin/mail-config/${id}/activate`);
  },

  async delete(id: string): Promise<void> {
    await blogClient.delete(`/admin/mail-config/${id}`);
  },

  async testSend(recipient: string): Promise<{ recipient: string; via: string }> {
    const { data } = await blogClient.post<APIEnvelope<{ recipient: string; via: string }>>(
      "/admin/mail-config/test-send", { recipient },
    );
    return data.data;
  },

  async outboxStats(): Promise<OutboxStats> {
    const { data } = await blogClient.get<APIEnvelope<OutboxStats>>("/admin/mail-config/outbox/stats");
    return data.data;
  },

  async outboxList(status?: string, limit = 50): Promise<EmailOutboxEntry[]> {
    const { data } = await blogClient.get<APIEnvelope<EmailOutboxEntry[]>>(
      "/admin/mail-config/outbox", { params: { status, limit } },
    );
    return data.data;
  },
};
