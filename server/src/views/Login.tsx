import type { FC } from 'hono/jsx';
import { basePath } from '../config';

export const Login: FC<{ error?: string; notice?: string }> = ({
  error,
  notice,
}) => (
  <div class="flex flex-col items-center">
    <h1 class="my-4 font-bold">Mit bestehendem Konto einloggen:</h1>
    <form
      method="post"
      action={`${basePath}/login`}
      class="flex flex-col items-center"
    >
      <div class="flex flex-col items-center pb-4 space-y-4">
        <label for="email-input">E-Mail</label>
        <input
          id="email-input"
          name="email"
          class="px-2"
          type="email"
          required
        />
      </div>
      <div class="flex flex-col items-center space-y-4">
        <label for="password-input">Passwort</label>
        <input
          id="password-input"
          name="password"
          class="px-2"
          type="password"
          minlength={8}
          maxlength={100}
          required
        />
      </div>
      <button type="submit" class="mt-8">
        Einloggen
      </button>

      <div class="flex flex-col items-center">
        {/* Shares the form so the address is carried over, and skips validation
            because the password field is irrelevant to a reset. */}
        <button
          type="submit"
          formaction={`${basePath}/reset/request`}
          formnovalidate
          class="mt-4 italic bg-transparent border-0"
        >
          Passwort vergessen?
        </button>
      </div>
      {notice ? <p class="mt-4">{notice}</p> : ''}
      {error ? <p class="mt-4">Ein Fehler ist aufgetreten: {error}</p> : ''}
    </form>
  </div>
);
