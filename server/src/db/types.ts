import type { Generated } from 'kysely';

// Only the tables the Hono app reads. TypeORM still owns their definitions
// until 6/6, so these types describe the live schema rather than declare it.
export interface UserTable {
  id: Generated<string>;
  email: string;
  password: string;
  salt: string;
  name: string;
  settings: unknown;
  verified: Generated<boolean>;
  consentedAt: Date;
  createdAt: Generated<Date>;
  updatedAt: Generated<Date>;
}

export interface VerifyTable {
  id: Generated<string>;
  userId: string | null;
  token: string;
  createdAt: Generated<Date>;
}

export interface ResetTable {
  id: Generated<string>;
  userId: string | null;
  token: string;
  createdAt: Generated<Date>;
}

export interface SessionTable {
  id: string;
  userId: string;
  createdAt: Generated<Date>;
  expiresAt: Date;
  lastSeenAt: Generated<Date>;
  userAgent: string | null;
}

export interface Database {
  user: UserTable;
  verify: VerifyTable;
  reset: ResetTable;
  session: SessionTable;
}
