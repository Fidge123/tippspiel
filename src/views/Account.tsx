import type { FC } from 'hono/jsx';
import type { AccountSettings } from '../account/writes';
import { basePath } from '../config';

export const Account: FC<{
  settings: AccountSettings;
  notice?: string;
  error?: string;
}> = ({ settings, notice, error }) => (
  <article class="p-4 m-auto space-y-4 max-w-prose">
    <h1 class="pb-4 text-xl font-bold">Account Details</h1>
    <section class="space-y-8">
      {error ? <p>🚨 Ein Fehler ist aufgetreten: {error}</p> : ''}
      {notice ? <p>{notice}</p> : ''}

      <form method="post" action={`${basePath}/account/name`}>
        <label for="username-input">
          <h1 class="font-bold">Benutzernamen ändern</h1>
        </label>
        <input
          id="username-input"
          name="name"
          class="px-2 mt-4 mr-4"
          type="text"
          value={settings.name}
          required
        />
        <button type="submit">Ändern</button>
      </form>

      <form method="post" action={`${basePath}/account/spoiler`}>
        <h1 class="font-bold">Spoilermodus-Standard</h1>
        <input
          id="spoiler-input"
          name="hideByDefault"
          class="mr-4"
          type="checkbox"
          checked={settings.hideByDefault}
        />
        <label for="spoiler-input">
          Spielergebnisse automatisch verstecken
        </label>
        <button type="submit" class="ml-4">
          Speichern
        </button>
      </form>

      <form method="post" action={`${basePath}/account/reminder`}>
        <h1 class="font-bold">Erinnerungsmails</h1>
        <input
          id="email-reminder-input"
          name="sendReminder"
          class="mr-4"
          type="checkbox"
          checked={settings.sendReminder}
        />
        <label for="email-reminder-input">Erinnerungsmails aktivieren</label>
        <button type="submit" class="ml-4">
          Speichern
        </button>
      </form>
    </section>
  </article>
);
