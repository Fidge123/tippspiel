import { db } from '../db/kysely';

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

async function merge(
  userId: string,
  patch: Record<string, unknown>,
): Promise<void> {
  const row = await db()
    .selectFrom('user')
    .select('settings')
    .where('id', '=', userId)
    .executeTakeFirstOrThrow();

  await db()
    .updateTable('user')
    .set({
      settings: JSON.stringify({ ...(row.settings as object), ...patch }),
    })
    .where('id', '=', userId)
    .execute();
}

export async function setHideByDefault(
  userId: string,
  hideByDefault: boolean,
): Promise<void> {
  await merge(userId, { hideByDefault });
}

export async function setSendReminder(
  userId: string,
  sendReminder: boolean,
): Promise<void> {
  await merge(userId, { sendReminder });
}
