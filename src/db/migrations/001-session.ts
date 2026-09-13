import { type Kysely, sql } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable('session')
    .addColumn('id', 'varchar', (col) => col.primaryKey())
    .addColumn('userId', 'uuid', (col) =>
      col.notNull().references('user.id').onDelete('cascade'),
    )
    .addColumn('createdAt', 'timestamp', (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .addColumn('expiresAt', 'timestamp', (col) => col.notNull())
    .addColumn('lastSeenAt', 'timestamp', (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .addColumn('userAgent', 'varchar')
    .execute();

  await db.schema
    .createIndex('session_userId_idx')
    .on('session')
    .column('userId')
    .execute();

  await db.schema
    .createIndex('session_expiresAt_idx')
    .on('session')
    .column('expiresAt')
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable('session').execute();
}
