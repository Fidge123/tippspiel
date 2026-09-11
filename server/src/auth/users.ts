import { db } from '../db/kysely';
import { hash, newSalt, newToken, verifyPassword } from './password';
import type { SessionUser } from './session';

export async function authenticate(
  email: string,
  password: string,
): Promise<SessionUser | undefined> {
  const user = await db()
    .selectFrom('user')
    .select(['id', 'name', 'email', 'salt', 'password'])
    .where('email', '=', email)
    .where('verified', '=', true)
    .executeTakeFirst();

  if (!(await verifyPassword(password, user))) {
    return undefined;
  }

  return { id: user!.id, name: user!.name, email: user!.email };
}

export async function createUser(
  email: string,
  name: string,
  password: string,
): Promise<{ id: string; token: string } | undefined> {
  const salt = newSalt();
  const token = newToken();

  try {
    return await db()
      .transaction()
      .execute(async (trx) => {
        const user = await trx
          .insertInto('user')
          .values({
            email,
            name,
            salt: salt.toString('hex'),
            password: (await hash(password, salt)).toString('hex'),
            settings: JSON.stringify({}),
            consentedAt: new Date(),
          })
          .returning('id')
          .executeTakeFirstOrThrow();

        await trx
          .insertInto('verify')
          .values({ userId: user.id, token })
          .execute();

        return { id: user.id, token };
      });
  } catch {
    return undefined;
  }
}

export async function verifyUser(id: string, token: string): Promise<boolean> {
  return db()
    .transaction()
    .execute(async (trx) => {
      const row = await trx
        .selectFrom('verify')
        .select('id')
        .where('userId', '=', id)
        .where('token', '=', token)
        .executeTakeFirst();

      if (!row) {
        return false;
      }

      await trx
        .updateTable('user')
        .set({ verified: true })
        .where('id', '=', id)
        .execute();
      await trx.deleteFrom('verify').where('id', '=', row.id).execute();

      return true;
    });
}

export async function createResetToken(
  email: string,
): Promise<{ id: string; name: string; token: string } | undefined> {
  const user = await db()
    .selectFrom('user')
    .select(['id', 'name'])
    .where('email', '=', email)
    .executeTakeFirst();

  if (!user) {
    return undefined;
  }

  const token = newToken();
  await db().insertInto('reset').values({ userId: user.id, token }).execute();

  return { id: user.id, name: user.name, token };
}

export async function resetPassword(
  id: string,
  token: string,
  password: string,
): Promise<boolean> {
  return db()
    .transaction()
    .execute(async (trx) => {
      const row = await trx
        .selectFrom('reset')
        .select('id')
        .where('userId', '=', id)
        .where('token', '=', token)
        .executeTakeFirst();

      if (!row) {
        return false;
      }

      const salt = newSalt();
      await trx
        .updateTable('user')
        .set({
          salt: salt.toString('hex'),
          password: (await hash(password, salt)).toString('hex'),
        })
        .where('id', '=', id)
        .execute();
      await trx.deleteFrom('reset').where('id', '=', row.id).execute();

      // A password change should end every other session.
      await trx.deleteFrom('session').where('userId', '=', id).execute();

      return true;
    });
}
