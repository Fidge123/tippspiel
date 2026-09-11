export const serverPort = Number(process.env.E2E_SERVER_PORT ?? 4175);

// Mirrors the location block in server/deploy/nginx.conf.example.
export const appPath = '/tippspiel';

export const baseURL = `http://127.0.0.1:${serverPort}${appPath}/`;
