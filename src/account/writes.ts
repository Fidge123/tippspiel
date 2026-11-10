import { db } from '../db/kysely';
import { mergeSettings } from '../db/settings';

export type AccountResult = { ok: true } | { ok: false; reason: 'invalid' };

export interface AccountSettings {
  name: string;
  hideByDefault: boolean;
  sendReminder: boolean;
}

export async function accountSettings(
  userId: string,
): Promise<AccountSettings> {
  const row = await db()
    .selectFrom('user')
    .select(['name', 'settings'])
    .where('id', '=', userId)
    .executeTakeFirstOrThrow();

  const settings = (row.settings ?? {}) as {
    hideByDefault?: boolean;
    sendReminder?: boolean;
  };

  return {
    name: row.name,
    hideByDefault: settings.hideByDefault ?? true,
    sendReminder: settings.sendReminder ?? true,
  };
}

export async function renameUser(
  userId: string,
  name: string,
): Promise<AccountResult> {
  if (!name.trim()) {
    return { ok: false, reason: 'invalid' };
  }

  await db()
    .updateTable('user')
    .set({ name: name.trim() })
    .where('id', '=', userId)
    .execute();

  return { ok: true };
}

export async function setHideByDefault(
  userId: string,
  hideByDefault: boolean,
): Promise<void> {
  await mergeSettings(userId, { hideByDefault });
}

export async function setSendReminder(
  userId: string,
  sendReminder: boolean,
): Promise<void> {
  await mergeSettings(userId, { sendReminder });
}
