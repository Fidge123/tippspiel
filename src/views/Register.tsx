import type { FC } from 'hono/jsx';
import { basePath } from '../config';

export const Register: FC<{ error?: string; success?: string }> = ({
  error,
  success,
}) => (
  <div class="flex flex-col items-center">
    <h1 class="my-4 font-bold">Ein neues Konto registrieren:</h1>
    <form
      method="post"
      action={`${basePath}/register`}
      class="flex flex-col items-center"
    >
      <div class="flex flex-col items-center pb-4 space-y-4">
        <label for="name-input">Name</label>
        <input id="name-input" name="name" class="px-2" type="text" required />
      </div>
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
      <div class="flex flex-col items-center pb-4 space-y-4">
        <label for="pw-input">Passwort</label>
        <input
          id="pw-input"
          name="password"
          class="px-2"
          type="password"
          minlength={8}
          maxlength={100}
          required
        />
      </div>
      <div class="flex flex-col items-center">
        <button class="m-4" type="submit">
          Registrieren
        </button>
      </div>
      {success ? <p>{success}</p> : ''}
      {error ? <p>Ein Fehler ist aufgetreten: {error}</p> : ''}
    </form>
  </div>
);
