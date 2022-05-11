import { readFile } from "fs/promises";

type availableTemplates =
  | "betReminder"
  | "newUserAlert"
  | "passwordReset"
  | "passwordResetAlert"
  | "userVerifiedAlert"
  | "verifyUser";

export async function loadHTML(
  name: availableTemplates,
  param: Record<string, string> = {}
) {
  const template = await readFile(`${__dirname}/${name}.html`, "utf8");

  return Object.entries(param).reduce(
    (html, [key, value]) =>
      html.replace(new RegExp(`{{ *${key} *}}`, "g"), value),
    template
  );
}

export async function loadTXT(
  name: availableTemplates,
  param: Record<string, string> = {}
) {
  const template = await readFile(`${__dirname}/${name}.txt`, "utf8");

  return Object.entries(param).reduce(
    (html, [key, value]) =>
      html.replace(new RegExp(`{{ *${key} *}}`, "g"), value),
    template
  );
}
