export const webPort = Number(process.env.E2E_WEB_PORT ?? 4173);
export const apiPort = Number(process.env.E2E_API_PORT ?? 4174);

// Mirrors REACT_APP_API_URL in frontend/.env and homepage in frontend/package.json.
export const apiPrefix = '/nfl/api';
export const appPath = '/tippspiel';

export const baseURL = `http://127.0.0.1:${webPort}${appPath}/`;
