import { type ChildProcess, spawn } from 'node:child_process';
import { connect } from 'node:net';
import { resolve } from 'node:path';
import { appPath } from './ports';

const server = resolve(__dirname, '../../server');

export interface HonoServer {
  stop(): Promise<void>;
}

export async function startServer(
  databaseUrl: string,
  port: number,
): Promise<HonoServer> {
  if (await inUse(port)) {
    throw new Error(`Port ${port} is taken, stop what is listening on it`);
  }

  const env = {
    ...process.env,
    DATABASE_URL: databaseUrl,
    PORT: String(port),
    BASE_PATH: appPath,
    COOKIE_SECRET: 'e2e-cookie-secret',
    EMAIL: 'admin@example.invalid',
    INSECURE_COOKIES: 'true',
    RATE_LIMIT_DISABLED: 'true',
    SMTP2GO_API_KEY: undefined,
  };

  await run('bun', ['run', 'migrate'], env);
  await run('bun', ['run', 'build:css'], env);

  const log: string[] = [];
  const child = spawn('bun', ['run', 'src/index.tsx'], {
    cwd: server,
    stdio: ['ignore', 'pipe', 'pipe'],
    env,
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

function run(
  command: string,
  args: string[],
  env: NodeJS.ProcessEnv,
): Promise<void> {
  return new Promise((done, fail) => {
    const log: string[] = [];
    const child = spawn(command, args, {
      cwd: server,
      stdio: ['ignore', 'pipe', 'pipe'],
      env,
    });
    child.stdout.on('data', (chunk) => log.push(chunk.toString()));
    child.stderr.on('data', (chunk) => log.push(chunk.toString()));
    child.on('error', fail);
    child.on('exit', (code) =>
      code === 0
        ? done()
        : fail(
            new Error(
              `${command} ${args.join(' ')} exited with ${code}\n${log.join('')}`,
            ),
          ),
    );
  });
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

async function waitForBoot(
  child: ChildProcess,
  port: number,
  log: string[],
): Promise<void> {
  const deadline = Date.now() + 60_000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(
        `Server exited with code ${child.exitCode}\n${log.join('')}`,
      );
    }
    const reached = await fetch(
      `http://127.0.0.1:${port}${appPath}/health`,
    ).catch(() => undefined);
    if (reached) {
      return;
    }
    await new Promise((done) => setTimeout(done, 200));
  }
  throw new Error(`Server did not answer on port ${port}\n${log.join('')}`);
}
