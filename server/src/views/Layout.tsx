import { html } from 'hono/html';
import type { FC, PropsWithChildren } from 'hono/jsx';
import type { SessionUser } from '../auth/session';
import { basePath } from '../config';

type LayoutProps = PropsWithChildren<{
  title: string;
  user?: SessionUser;
  loginAction?: 'login' | 'register';
}>;

/** The SPA's hamburger was a useState dropdown; details/summary needs no script. */
const Menu: FC = () => (
  <details class="relative pointer-events-auto">
    <summary class="list-none cursor-pointer">
      <svg
        viewBox="0 0 100 80"
        width="16"
        height="16"
        role="img"
        aria-label="Menü öffnen"
        fill="currentColor"
      >
        <rect width="100" height="12" />
        <rect y="33" width="100" height="12" />
        <rect y="66" width="100" height="12" />
      </svg>
    </summary>
    <ul class="fixed z-10 top-12 right-0 bg-slate-100 px-4 py-2 space-y-2 text-black">
      <li>
        <a href={`${basePath}/account`}>Account</a>
      </li>
      <li>
        <a href={`${basePath}/leagues`}>Ligen</a>
      </li>
      <li>
        <a href={`${basePath}/rules`}>Regeln</a>
      </li>
      <li>
        <a href={`${basePath}/impressum`}>Impressum</a>
      </li>
      <li>
        <form method="post" action={`${basePath}/logout`}>
          <button type="submit">Ausloggen</button>
        </form>
      </li>
    </ul>
  </details>
);

export const Layout: FC<LayoutProps> = ({
  title,
  user,
  loginAction = 'login',
  children,
}) => (
  <>
    {html`<!DOCTYPE html>`}
    <html lang="de">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        <meta
          name="description"
          content="Pick the winning teams. Play against your friends!"
        />
        <link rel="icon" href={`${basePath}/favicon.ico`} />
        <link rel="apple-touch-icon" href={`${basePath}/logo192.png`} />
        <link rel="manifest" href={`${basePath}/manifest.json`} />
        <link rel="stylesheet" href={`${basePath}/app.css`} />
        <title>{title}</title>
      </head>
      <body>
        <div class="w-screen h-screen">
          <div class="fixed z-50 flex items-center justify-between w-screen h-12 px-4 bg-gray-900 pointer-events-auto">
            <nav class="w-full space-x-4 font-semibold text-white">
              {user ? (
                <>
                  <a href={`${basePath}/`}>Tippspiel</a>
                  <a href={`${basePath}/leaderboard`}>Tabelle</a>
                  <a href={`${basePath}/division`}>Divisions</a>
                </>
              ) : (
                ''
              )}
            </nav>
            {user ? (
              <Menu />
            ) : loginAction === 'register' ? (
              <a href={`${basePath}/register`}>
                <button type="button">Registrieren</button>
              </a>
            ) : (
              <a href={`${basePath}/login`}>
                <button type="button">Einloggen</button>
              </a>
            )}
          </div>
          <div class="min-h-full pt-12 dark:text-gray-100">{children}</div>
        </div>
      </body>
    </html>
  </>
);
