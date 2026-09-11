import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';
import {
  clearAuthCookies,
  readSessionCookie,
  setSessionCookie,
} from '../auth/cookies';
import type { Variables } from '../auth/middleware';
import { rateLimit } from '../auth/rateLimit';
import { createSession, revokeSession } from '../auth/session';
import {
  authenticate,
  createResetToken,
  createUser,
  deleteUser,
  resetPassword,
  verifyUser,
} from '../auth/users';
import { adminEmail, basePath, siteUrl } from '../config';
import { sendEmail } from '../email/send';
import { loadHTML, loadTXT } from '../email/templates';
import { Layout } from '../views/Layout';
import { Login } from '../views/Login';
import { Register } from '../views/Register';
import { Reset } from '../views/Reset';
import { Verify } from '../views/Verify';

const password = z.string().min(8).max(100);
const credentials = z.object({ email: z.string().email(), password });
const registration = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password,
});
const tokenPair = z.object({ id: z.string().min(1), token: z.string().min(1) });

export const auth = new Hono<{ Variables: Variables }>();

auth.get('/login', (c) =>
  c.get('user')
    ? c.redirect(`${basePath}/`, 303)
    : c.html(
        <Layout title="Einloggen" loginAction="register">
          <Login />
        </Layout>,
      ),
);

auth.post(
  '/login',
  rateLimit('login', 10),
  zValidator('form', credentials, (result, c) =>
    result.success
      ? undefined
      : c.html(
          <Layout title="Einloggen" loginAction="register">
            <Login error="E-Mail oder Passwort ist ungültig." />
          </Layout>,
          400,
        ),
  ),
  async (c) => {
    const { email, password } = c.req.valid('form');
    const user = await authenticate(email, password);

    if (!user) {
      return c.html(
        <Layout title="Einloggen" loginAction="register">
          <Login error="E-Mail oder Passwort ist falsch." />
        </Layout>,
        401,
      );
    }

    const session = await createSession(
      user.id,
      c.req.header('user-agent') ?? null,
    );
    await setSessionCookie(c, session.id, session.expiresAt);

    return c.redirect(`${basePath}/`, 303);
  },
);

auth.post('/logout', async (c) => {
  const id = await readSessionCookie(c);
  if (id) {
    await revokeSession(id);
  }
  clearAuthCookies(c);

  return c.redirect(`${basePath}/login`, 303);
});

auth.get('/register', (c) =>
  c.get('user')
    ? c.redirect(`${basePath}/`, 303)
    : c.html(
        <Layout title="Registrieren">
          <Register />
        </Layout>,
      ),
);

auth.post(
  '/register',
  rateLimit('register', 3),
  zValidator('form', registration, (result, c) =>
    result.success
      ? undefined
      : c.html(
          <Layout title="Registrieren">
            <Register error="Bitte prüfe Name, E-Mail und ein Passwort mit mindestens 8 Zeichen." />
          </Layout>,
          400,
        ),
  ),
  async (c) => {
    const { email, name, password } = c.req.valid('form');
    const created = await createUser(email, name, password);

    if (!created) {
      return c.html(
        <Layout title="Registrieren">
          <Register error="Es existiert bereits ein Konto mit dieser E-Mail." />
        </Layout>,
        409,
      );
    }

    const now = new Date();
    const link = `${siteUrl}${basePath}/verify?id=${created.id}&token=${created.token}`;

    await sendEmail({
      to: adminEmail,
      subject: 'Neuer Nutzer registriert',
      text: await loadTXT('newUserAlert'),
      html: await loadHTML('newUserAlert', {
        id: created.id,
        time: now.toLocaleString(),
      }),
    }).catch((error) => console.error(error));

    // An account nobody can verify is an account nobody can log into, so a
    // failed verification mail undoes the registration instead of reporting
    // success. The admin alert above is not worth failing a signup over.
    try {
      await sendEmail({
        to: email,
        subject: 'Bitte verifiziere deinen neuen Tippspiel Account',
        text: await loadTXT('verifyUser', { name, link }),
        html: await loadHTML('verifyUser', { name, link }),
      });
    } catch (error) {
      console.error(error);
      await deleteUser(created.id);

      return c.html(
        <Layout title="Registrieren">
          <Register error="Die Bestätigungs-E-Mail konnte nicht verschickt werden. Bitte versuche es später noch einmal." />
        </Layout>,
        502,
      );
    }

    return c.html(
      <Layout title="Registrieren">
        <Register success="Erfolgreich registriert! Du solltest gleich eine E-Mail mit einem Bestätigungslink erhalten. Nach der Bestätigung kannst du dich einloggen." />
      </Layout>,
    );
  },
);

auth.get('/verify', (c) =>
  c.html(
    <Layout title="Account bestätigen">
      <Verify id={c.req.query('id')} token={c.req.query('token')} />
    </Layout>,
  ),
);

auth.post(
  '/verify',
  rateLimit('verify', 10),
  zValidator('form', tokenPair, (result, c) =>
    result.success
      ? undefined
      : c.html(
          <Layout title="Account bestätigen">
            <Verify error="Der Link ist ungültig." />
          </Layout>,
          400,
        ),
  ),
  async (c) => {
    const { id, token } = c.req.valid('form');

    if (!(await verifyUser(id, token))) {
      return c.html(
        <Layout title="Account bestätigen">
          <Verify error="Der Link ist ungültig oder abgelaufen." />
        </Layout>,
        400,
      );
    }

    await sendEmail({
      to: adminEmail,
      subject: 'Nutzer verifiziert',
      text: await loadTXT('userVerifiedAlert'),
      html: await loadHTML('userVerifiedAlert', {
        id,
        time: new Date().toLocaleString(),
      }),
    }).catch((error) => console.error(error));

    return c.html(
      <Layout title="Account bestätigen">
        <Verify success="Account erfolgreich bestätigt! Du kannst dich jetzt einloggen." />
      </Layout>,
    );
  },
);

auth.post(
  '/reset/request',
  rateLimit('reset-request', 10),
  zValidator('form', z.object({ email: z.string().email() }), (result, c) =>
    result.success
      ? undefined
      : c.html(
          <Layout title="Einloggen" loginAction="register">
            <Login error="Bitte gib zuerst deine E-Mail-Adresse ein." />
          </Layout>,
          400,
        ),
  ),
  async (c) => {
    const { email } = c.req.valid('form');
    const reset = await createResetToken(email);

    if (reset) {
      const now = new Date();
      const link = `${siteUrl}${basePath}/reset?id=${reset.id}&token=${reset.token}`;

      await sendEmail({
        to: adminEmail,
        subject: 'Passwort Reset angefragt',
        text: await loadTXT('passwordResetAlert'),
        html: await loadHTML('passwordResetAlert', {
          id: reset.id,
          time: now.toLocaleString(),
        }),
      }).catch((error) => console.error(error));

      await sendEmail({
        to: email,
        subject: 'Tippspiel Passwort zurücksetzen',
        text: await loadTXT('passwordReset', { name: reset.name, link }),
        html: await loadHTML('passwordReset', { name: reset.name, link }),
      }).catch((error) => console.error(error));
    }

    // Says the same thing either way, so the form cannot be used to find out
    // which addresses have an account.
    return c.html(
      <Layout title="Einloggen" loginAction="register">
        <Login notice="Falls ein Konto mit dieser E-Mail existiert, wurde ein Link zum Zurücksetzen verschickt." />
      </Layout>,
    );
  },
);

auth.get('/reset', (c) =>
  c.html(
    <Layout title="Passwort zurücksetzen">
      <Reset id={c.req.query('id')} token={c.req.query('token')} />
    </Layout>,
  ),
);

auth.post(
  '/reset',
  rateLimit('reset', 1),
  zValidator('form', tokenPair.extend({ password }), (result, c) =>
    result.success
      ? undefined
      : c.html(
          <Layout title="Passwort zurücksetzen">
            <Reset error="Das Passwort muss mindestens 8 Zeichen lang sein." />
          </Layout>,
          400,
        ),
  ),
  async (c) => {
    const { id, token, password } = c.req.valid('form');

    if (!(await resetPassword(id, token, password))) {
      return c.html(
        <Layout title="Passwort zurücksetzen">
          <Reset error="Der Link ist ungültig oder abgelaufen." />
        </Layout>,
        400,
      );
    }

    return c.html(
      <Layout title="Passwort zurücksetzen">
        <Reset success="Passwort erfolgreich zurückgesetzt! Du kannst dich jetzt einloggen." />
      </Layout>,
    );
  },
);
