export const webPort = Number(process.env.E2E_WEB_PORT ?? 4173);
export const apiPort = Number(process.env.E2E_API_PORT ?? 4174);
// A second backend, for the one flow that sends mail through SMTP2GO for real.
export const mailApiPort = Number(process.env.E2E_MAIL_API_PORT ?? 4175);

// Mirrors REACT_APP_API_URL in frontend/.env and homepage in frontend/package.json.
export const apiPrefix = '/nfl/api';
export const appPath = '/tippspiel';

export const baseURL = `http://127.0.0.1:${webPort}${appPath}/`;
