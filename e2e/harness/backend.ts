import { type ChildProcess, spawn } from 'node:child_process';
import { connect } from 'node:net';
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
  // A backend left over from an earlier run would answer the readiness probe.
  if (await inUse(port)) {
    throw new Error(`Port ${port} is taken, stop what is listening on it`);
  }

  const log: string[] = [];
  const child = spawn(process.execPath, ['dist/main.js'], {
    cwd: backend,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: {
      ...process.env,
      DATABASE_URL: databaseUrl,
      PORT: String(port),
      JWT_SECRET: 'e2e-jwt-secret',
      REFRESH_SECRET: 'e2e-refresh-secret',
      COOKIE_SECRET: 'e2e-cookie-secret',
      EMAIL: 'admin@example.invalid',
      SKIP_BACKUP: 'true',
      SMTP2GO_API_KEY: undefined,
    },
  });

  const record = (chunk: Buffer) => {
    log.push(chunk.toString());
    log.splice(0, log.length - 200);
  };
  child.stdout.on('data', record);
  child.stderr.on('data', record);

  await waitForBoot(child, port, log);

  return {
    stop: () =>
      new Promise<void>((done) => {
        child.once('exit', () => done());
        child.kill('SIGTERM');
      }),
  };
}

function inUse(port: number): Promise<boolean> {
  return new Promise((done) => {
    const socket = connect({ port, host: '127.0.0.1' })
      .on('connect', () => {
        socket.destroy();
        done(true);
      })
      .on('error', () => done(false));
  });
}

// The application applies the migrations on boot, so it answers once the schema is there.
async function waitForBoot(
  child: ChildProcess,
  port: number,
  log: string[],
): Promise<void> {
  const deadline = Date.now() + 60_000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(
        `Backend exited with code ${child.exitCode}\n${log.join('')}`,
      );
    }
    const reached = await fetch(`http://127.0.0.1:${port}/schedule/${season}`)
      .then(() => true)
      .catch(() => false);
    if (reached) {
      return;
    }
    await new Promise((done) => setTimeout(done, 200));
  }
  throw new Error(`Backend did not answer on port ${port}\n${log.join('')}`);
}
