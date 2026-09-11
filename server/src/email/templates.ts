import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

type Template =
  | 'newUserAlert'
  | 'passwordReset'
  | 'passwordResetAlert'
  | 'userVerifiedAlert'
  | 'verifyUser';

const here = dirname(fileURLToPath(import.meta.url));

async function load(
  name: Template,
  extension: 'html' | 'txt',
  param: Record<string, string>,
): Promise<string> {
  const template = await readFile(
    join(here, 'templates', `${name}.${extension}`),
    'utf8',
  );

  return Object.entries(param).reduce(
    (filled, [key, value]) =>
      filled.replace(new RegExp(`{{ *${key} *}}`, 'g'), value),
    template,
  );
}

export async function loadHTML(
  name: Template,
  param: Record<string, string> = {},
): Promise<string> {
  return load(name, 'html', param);
}

export async function loadTXT(
  name: Template,
  param: Record<string, string> = {},
): Promise<string> {
  return load(name, 'txt', param);
}
