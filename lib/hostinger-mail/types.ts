export type HostingerFolder = "inbox" | "sent" | "drafts" | "archive" | "spam" | "trash" | string;
export type HostingerAddress = { email: string; name?: string };
export type HostingerMessageSummary = { id: string; mailbox?: string; folder: HostingerFolder; from: HostingerAddress; to: HostingerAddress[]; subject: string; excerpt?: string; date: string; read: boolean; hasAttachments: boolean; threadId?: string };
export type HostingerMessageDetail = HostingerMessageSummary & { cc?: HostingerAddress[]; bcc?: HostingerAddress[]; textBody?: string; htmlBody?: string; attachments?: { id: string; filename: string; contentType?: string; size?: number }[] };
export type PaginatedMessages = { items: HostingerMessageSummary[]; page: number; perPage: number; total?: number; nextPage?: number | null };
export type SendMailInput = { to: string[]; cc?: string[]; bcc?: string[]; subject: string; text: string; inReplyTo?: string; references?: string[] };
export type WebhookPayload = { event: "message.received"; id?: string; message?: { id?: string; mailbox?: string; from?: string; subject?: string; excerpt?: string; timestamp?: string } };
