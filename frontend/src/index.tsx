import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { RecoilRoot } from 'recoil';
import { BrowserRouter } from 'react-router-dom';

import './index.css';
import App from './App';
import { isLoggedIn, refresh } from './api';

const root = ReactDOM.createRoot(document.getElementById('root')!);

// The Hono app owns /login from 2/6 and can only hand over an HttpOnly cookie,
// so the access token has to be traded for before the first route decision:
// isLoggedIn reads localStorage, which a server-rendered login cannot write.
// Goes away with the SPA in 6/6.
async function bootstrap() {
  if (!isLoggedIn()) {
    await refresh().catch(() => undefined);
  }

  root.render(
    <StrictMode>
      <RecoilRoot>
        <BrowserRouter basename="tippspiel">
          <App />
        </BrowserRouter>
      </RecoilRoot>
    </StrictMode>,
  );
}

bootstrap();
