import { env } from "~/env";

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export interface SMTP2GoResponse {
  request_id: string;
  data: {
    succeeded: number;
    failed: number;
    failures: Array<{
      email: string;
      error_code: string;
      error_message: string;
    }>;
  };
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: EmailOptions): Promise<void> {
  const payload = {
    api_key: env.SMTP2GO_API_KEY,
    to: [to],
    sender: `${env.SMTP2GO_SENDER_NAME} <${env.SMTP2GO_SENDER_EMAIL}>`,
    subject: subject,
    html_body: html,
    text_body: text,
  };

  if (
    to.endsWith("example.com") ||
    (text.includes("[Link zur Anwendung](http://localhost:3000)") &&
      to === env.SMTP2GO_SENDER_EMAIL)
  ) {
    return; // Skip sending test emails
  }

  const response = await fetch(`${env.SMTP2GO_API_URL}/email/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`SMTP2Go API error: ${response.status} - ${errorText}`);
  }

  const result = (await response.json()) as SMTP2GoResponse;

  if (result.data.failed > 0) {
    const failures = result.data.failures
      .map((f) => `${f.email}: ${f.error_message} (${f.error_code})`)
      .join(", ");
    throw new Error(`Email failed to send: ${failures}`);
  }
}
