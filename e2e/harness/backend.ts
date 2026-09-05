import { type ChildProcess, spawn } from 'node:child_process';
import { resolve } from 'node:path';
import { season } from './seed';

const backend = resolve(__dirname, '../../backend');

export interface Backend {
  stop(): Promise<void>;
}

export async function startBackend(
  databaseUrl: string,
  port: number,
): Promise<Backend> {
  const child = spawn(process.execPath, ['dist/main.js'], {
    cwd: backend,
    stdio: ['ignore', 'ignore', 'inherit'],
    env: {
      ...process.env,
      DATABASE_URL: databaseUrl,
      PORT: String(port),
      JWT_SECRET: 'e2e-jwt-secret',
      REFRESH_SECRET: 'e2e-refresh-secret',
      COOKIE_SECRET: 'e2e-cookie-secret',
      EMAIL: 'admin@example.invalid',
      SKIP_BACKUP: 'true',
      POSTMARK: undefined,
    },
  });

  await waitForBoot(child, port);

  return {
    stop: () =>
      new Promise<void>((done) => {
        child.once('exit', () => done());
        child.kill('SIGTERM');
      }),
  };
}

// The application applies the migrations on boot, so it answers once the schema is there.
async function waitForBoot(child: ChildProcess, port: number): Promise<void> {
  const deadline = Date.now() + 60_000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(`Backend exited with code ${child.exitCode}`);
    }
    const reached = await fetch(`http://127.0.0.1:${port}/schedule/${season}`)
      .then(() => true)
      .catch(() => false);
    if (reached) {
      return;
    }
    await new Promise((done) => setTimeout(done, 200));
  }
  throw new Error(`Backend did not answer on port ${port}`);
}
