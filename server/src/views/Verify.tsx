import type { FC } from 'hono/jsx';
import { basePath } from '../config';

/**
 * The SPA verified from a useEffect on page load. Without JavaScript the link
 * can only land on a page, so the confirmation is an explicit submit.
 */
export const Verify: FC<{
  id?: string;
  token?: string;
  error?: string;
  success?: string;
}> = ({ id, token, error, success }) => (
  <div class="flex flex-col items-center">
    <h1 class="my-4 font-bold">Account bestätigen</h1>
    {success ? (
      <p>{success}</p>
    ) : (
      <form
        method="post"
        action={`${basePath}/verify`}
        class="flex flex-col items-center"
      >
        <input type="hidden" name="id" value={id ?? ''} />
        <input type="hidden" name="token" value={token ?? ''} />
        <button type="submit" class="m-8">
          Account bestätigen
        </button>
      </form>
    )}
    {error ? <p>Ein Fehler ist aufgetreten: {error}</p> : ''}
  </div>
);
