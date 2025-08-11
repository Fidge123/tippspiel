import { readFileSync } from "node:fs";
import { join } from "node:path";
import { marked } from "marked";

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

interface TemplateVariables {
  [key: string]: string;
}

function replaceVariables(
  content: string,
  variables: TemplateVariables,
): string {
  return content.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return variables[key] ?? match;
  });
}

function markdownToText(markdown: string): string {
  // Simple markdown to text conversion
  return markdown
    .replace(/#{1,6}\s+(.+)/g, "$1") // Remove headers
    .replace(/\*\*(.*?)\*\*/g, "$1") // Remove bold
    .replace(/\*(.*?)\*/g, "$1") // Remove italic
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Remove links, keep text
    .replace(/`([^`]+)`/g, "$1") // Remove code formatting
    .replace(/\n{2,}/g, "\n\n") // Normalize line breaks
    .trim();
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
  variables: TemplateVariables = {},
  subject: string,
): Promise<EmailTemplate> {
  const rawTemplate = loadTemplate(templateName);
  const processedMarkdown = replaceVariables(rawTemplate, variables);

  const html = await marked(processedMarkdown);
  const text = markdownToText(processedMarkdown);

  return {
    subject: replaceVariables(subject, variables),
    html,
    text,
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
