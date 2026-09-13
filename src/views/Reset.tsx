import type { FC } from 'hono/jsx';
import { basePath } from '../config';

export const Reset: FC<{
  id?: string;
  token?: string;
  error?: string;
  success?: string;
}> = ({ id, token, error, success }) => (
  <div class="flex flex-col items-center">
    <h1 class="my-4 font-bold">Passwort zurücksetzen</h1>
    {success ? (
      <p>{success}</p>
    ) : (
      <form
        method="post"
        action={`${basePath}/reset`}
        class="flex flex-col items-center"
      >
        <input type="hidden" name="id" value={id ?? ''} />
        <input type="hidden" name="token" value={token ?? ''} />
        <div class="space-x-2 space-y-4">
          <label for="pw-input">Neues Passwort</label>
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
        <button type="submit" class="m-8">
          Zurücksetzen
        </button>
      </form>
    )}
    {error ? <p>Ein Fehler ist aufgetreten: {error}</p> : ''}
  </div>
);
