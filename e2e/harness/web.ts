import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import {
  createServer,
  type IncomingMessage,
  request,
  type Server,
  type ServerResponse,
} from 'node:http';
import { extname, join, resolve, sep } from 'node:path';
import { apiPrefix, appPath } from './ports';

const build = resolve(__dirname, '../../frontend/build');

const contentTypes: Record<string, string> = {
  '.css': 'text/css',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.map': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
};

export interface WebServer {
  stop(): Promise<void>;
}

export async function startWeb(
  port: number,
  backendPort: number,
): Promise<WebServer> {
  const server = createServer((req, res) => {
    const url = req.url ?? '/';
    if (url.startsWith(`${apiPrefix}/`)) {
      proxy(req, res, backendPort, url.slice(apiPrefix.length));
    } else if (url.startsWith(`${appPath}/`)) {
      serve(res, url.slice(appPath.length + 1).split('?')[0]).catch(() =>
        res.destroy(),
      );
    } else {
      res.writeHead(302, { Location: `${appPath}/` }).end();
    }
  });

  await listen(server, port);

  return {
    stop: () =>
      new Promise<void>((done, fail) =>
        server.close((error) => (error ? fail(error) : done())),
      ),
  };
}

function proxy(
  req: IncomingMessage,
  res: ServerResponse,
  port: number,
  path: string,
): void {
  const upstream = request(
    {
      host: '127.0.0.1',
      port,
      path,
      method: req.method,
      headers: { ...req.headers, host: `127.0.0.1:${port}` },
    },
    (response) => {
      res.writeHead(response.statusCode ?? 502, response.headers);
      response.pipe(res);
    },
  );
  upstream.on('error', (error) => {
    res.writeHead(502, { 'Content-Type': 'text/plain' }).end(error.message);
  });
  req.pipe(upstream);
}

async function serve(res: ServerResponse, path: string): Promise<void> {
  const file = resolve(build, path);
  const asset = file.startsWith(build + sep) && (await isFile(file));
  const served = asset ? file : join(build, 'index.html');

  res.writeHead(200, {
    'Content-Type': contentTypes[extname(served)] ?? 'application/octet-stream',
    'Cache-Control': 'no-store',
  });
  createReadStream(served)
    .on('error', () => res.destroy())
    .pipe(res);
}

async function isFile(path: string): Promise<boolean> {
  return stat(path)
    .then((stats) => stats.isFile())
    .catch(() => false);
}

function listen(server: Server, port: number): Promise<void> {
  return new Promise((done, fail) => {
    server.once('error', fail);
    server.listen(port, '127.0.0.1', done);
  });
}
