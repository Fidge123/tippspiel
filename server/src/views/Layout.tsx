import { html } from 'hono/html';
import type { FC, PropsWithChildren } from 'hono/jsx';
import { basePath } from '../config';

type LayoutProps = PropsWithChildren<{ title: string }>;

export const Layout: FC<LayoutProps> = ({ title, children }) => (
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
            <nav class="w-full space-x-4 font-semibold text-white" />
            <a href={`${basePath}/login`}>
              <button type="button">Einloggen</button>
            </a>
          </div>
          <div class="min-h-full pt-12 dark:text-gray-100">{children}</div>
        </div>
      </body>
    </html>
  </>
);
