import { readFileSync } from "node:fs";
import { join } from "node:path";
import { marked } from "marked";

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

function replaceVariables(content: string, variables: Dict<string>): string {
  return content.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return variables[key] ?? match;
  });
}

function loadTemplate(templateName: string): string {
  const templatePath = join(
    process.cwd(),
    "src",
    "server",
    "email",
    "templates",
    `${templateName}.md`,
  );
  return readFileSync(templatePath, "utf-8");
}

export async function renderEmailTemplate(
  templateName: string,
  variables: Dict<string> = {},
  subject: string,
): Promise<EmailTemplate> {
  const processedMarkdown = replaceVariables(
    loadTemplate(templateName),
    variables,
  );

  return {
    subject: replaceVariables(subject, variables),
    html: await marked(processedMarkdown),
    text: processedMarkdown,
  };
}

export async function createVerificationEmail(
  userName: string,
  verificationToken: string,
  appUrl: string,
): Promise<EmailTemplate> {
  const verificationUrl = `${appUrl}/auth/verify?token=${verificationToken}`;

  return await renderEmailTemplate(
    "verification",
    {
      userName,
      verificationUrl,
      appUrl,
    },
    "Tippspiel - E-Mail-Adresse bestätigen",
  );
}
