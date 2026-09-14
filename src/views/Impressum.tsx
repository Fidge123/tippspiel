import type { FC } from 'hono/jsx';
import { Legal } from './Legal';
import { Terms } from './Terms';

export const Impressum: FC = () => (
  <div class="p-4 m-auto max-w-prose">
    <article>
      <h1 class="text-xl font-bold">Impressum</h1>
      <p class="py-1">Seitenbetreiber:</p>
      <p class="py-1">
        Florian Richter
        <br />
        Konrad-Zuse-Ring 10
        <br />
        14469 Potsdam
      </p>
      <p class="py-1">E-Mail: admin@nfl-tippspiel.de</p>
      <p class="py-1">
        Diese Seite ist wird privat betrieben und nicht gewerblich genutzt.
      </p>
    </article>
    <Terms />
    <Legal />
  </div>
);
