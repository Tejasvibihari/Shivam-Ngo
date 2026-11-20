import "server-only";
import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import { CONTACT } from "@/lib/org";
import { FORM_FIELDS, FORM_TITLES, subjectFor, type ParsedForm } from "@/lib/forms";

/**
 * Sends website form submissions to the NGO inbox using the Hostinger mailbox
 * (admin@roottechnology.in) over SMTP. All settings come from environment
 * variables, see `.env.example`.
 */

export class MailConfigError extends Error {}

let cached: Transporter | null = null;

function getTransporter(): Transporter {
    if (cached) return cached;

    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    if (!user || !pass) {
        throw new MailConfigError("SMTP_USER / SMTP_PASS are not set.");
    }

    const port = Number(process.env.SMTP_PORT ?? 465);
    const secure = process.env.SMTP_SECURE
        ? process.env.SMTP_SECURE === "true"
        : port === 465;

    cached = nodemailer.createTransport({
        host: process.env.SMTP_HOST ?? "smtp.hostinger.com",
        port,
        secure, // true = SSL on 465, false = STARTTLS on 587
        auth: { user, pass },
        connectionTimeout: 15_000,
        greetingTimeout: 15_000,
        socketTimeout: 20_000,
    });
    return cached;
}

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function buildBodies(form: ParsedForm) {
    const fields = FORM_FIELDS[form.type].filter((f) => form.values[f.key]);
    const title = FORM_TITLES[form.type];
    const when = new Date().toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        dateStyle: "medium",
        timeStyle: "short",
    });

    const text = [
        `New ${title.toLowerCase()} from the website`,
        `Submitted from: ${form.source}`,
        `Received: ${when} (IST)`,
        "",
        ...fields.map((f) =>
            f.kind === "longtext"
                ? `${f.label}:\n${form.values[f.key]}\n`
                : `${f.label}: ${form.values[f.key]}`,
        ),
    ].join("\n");

    const rows = fields
        .map(
            (f) => `
        <tr>
          <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;color:#6b7280;font-size:13px;white-space:nowrap;vertical-align:top;">${escapeHtml(f.label)}</td>
          <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;color:#111827;font-size:14px;white-space:pre-wrap;">${escapeHtml(form.values[f.key])}</td>
        </tr>`,
        )
        .join("");

    const html = `
<div style="font-family:Arial,Helvetica,sans-serif;max-width:620px;margin:0 auto;">
  <h2 style="margin:0 0 4px;color:#14532d;">New ${escapeHtml(title.toLowerCase())}</h2>
  <p style="margin:0 0 16px;color:#6b7280;font-size:13px;">
    Submitted from: ${escapeHtml(form.source)} &middot; ${escapeHtml(when)} (IST)
  </p>
  <table role="presentation" cellspacing="0" cellpadding="0" style="width:100%;border:1px solid #e5e7eb;border-radius:8px;border-collapse:separate;">
    ${rows}
  </table>
  <p style="margin:16px 0 0;color:#9ca3af;font-size:12px;">
    ${form.values.email ? "Press Reply to answer the sender directly." : "The sender did not give an email address. Please call the phone number above."}
  </p>
</div>`;

    return { text, html };
}

export async function sendFormEmail(form: ParsedForm): Promise<void> {
    const transporter = getTransporter();
    const user = process.env.SMTP_USER as string;
    const to = process.env.MAIL_TO || CONTACT.email;
    const fromName = process.env.MAIL_FROM_NAME || "NGO Shivam Website";
    const { text, html } = buildBodies(form);

    await transporter.sendMail({
        // Hostinger only accepts the authenticated mailbox as the sender.
        from: { name: fromName, address: user },
        to,
        // Reply goes to the visitor, so the team can just press "Reply".
        replyTo: form.values.email
            ? { name: form.values.name, address: form.values.email }
            : undefined,
        subject: subjectFor(form),
        text,
        html,
    });
}
