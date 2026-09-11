import type { FC } from 'hono/jsx';

/**
 * The examples in the SPA were parallel mock renderings of the real components.
 * They were interactive only in the sense of being behind a toggle, so they are
 * a details element and static markup here.
 */
const WeekExample: FC = () => (
  <table class="mt-2 text-sm">
    <thead>
      <tr>
        <th>Tipp</th>
        <th>Einsatz</th>
        <th>Ergebnis</th>
        <th>Punkte</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Ravens</td>
        <td>3</td>
        <td>Ravens gewinnen</td>
        <td>+3</td>
      </tr>
      <tr>
        <td>Ravens 🌟</td>
        <td>3</td>
        <td>Ravens gewinnen</td>
        <td>+6</td>
      </tr>
      <tr>
        <td>Ravens</td>
        <td>3</td>
        <td>Ravens verlieren</td>
        <td>-3</td>
      </tr>
      <tr>
        <td>Ravens 🌟</td>
        <td>3</td>
        <td>Ravens verlieren</td>
        <td>-3</td>
      </tr>
      <tr>
        <td>Ravens</td>
        <td>3</td>
        <td>Unentschieden</td>
        <td>0</td>
      </tr>
      <tr>
        <td>Ravens</td>
        <td>3</td>
        <td>Ravens gewinnen, höchstens ein Drittel tippte so</td>
        <td>+4</td>
      </tr>
      <tr>
        <td>kein Tipp</td>
        <td>—</td>
        <td>beliebig</td>
        <td>-1</td>
      </tr>
    </tbody>
  </table>
);

const DivisionExample: FC = () => (
  <table class="mt-2 text-sm">
    <thead>
      <tr>
        <th>Tipp</th>
        <th>Punkte</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Bills &gt; Dolphins &gt; Patriots &gt; Jets</td>
        <td>7 + 1 + 1 + 1 + 5 = 15</td>
      </tr>
      <tr>
        <td>Bills &gt; Patriots &gt; Dolphins &gt; Jets</td>
        <td>7 + 1 = 8</td>
      </tr>
      <tr>
        <td>Dolphins &gt; Bills &gt; Patriots &gt; Jets</td>
        <td>1 + 1 = 2</td>
      </tr>
      <tr>
        <td>Jets &gt; Patriots &gt; Dolphins &gt; Bills</td>
        <td>0</td>
      </tr>
    </tbody>
  </table>
);

export const Rules: FC = () => (
  <article class="p-4">
    <h1 class="pb-4 text-xl font-bold">Regeln</h1>
    <p>
      Die Platzierung wird durch die erzielten Punkte bestimmt. Es gelten die
      folgenden Regeln bei der Punkteverteilung.
    </p>
    <section class="py-4 space-y-2">
      <h2 class="font-bold text-l">Reguläre Saison und Playoffs</h2>
      <p>Spiele müssen vor der offiziellen Startzeit getippt werden.</p>
      <ul class="pl-12 list-disc list-outside">
        <li>Pro Tipp können zwischen 1 und 5 Punkte gesetzt werden.</li>
        <li>Der Einsatz wird gutgeschrieben wenn das Team gewinnt.</li>
        <li>Der Einsatz wird abgezogen wenn das Team verliert.</li>
        <li>
          Bei Unentschieden werden Punkte weder abgezogen noch gutgeschrieben.
        </li>
        <li>
          Wird ein Spiel nicht getippt, wird ein Punkt abgezogen, unabhängig vom
          Ergebnis.
        </li>
        <li>
          Wenn ein Drittel oder weniger der Tipps korrekt waren, wird den
          richtigen Tipps ein Extrapunkt gutgeschrieben.
        </li>
        <li>
          Jeder Spieler kann wöchentlich einen Doppler (🌟) setzen. Der Doppler
          verdoppelt gutgeschriebene Punkte bei einem korrekten Tipp.
        </li>
      </ul>
      <p>
        Es kann zu jeder Zeit die Anzahl der eingetragenen Tipps pro Team
        gesehen werden. Die Namen und der Einsatz der Spieler wird nach
        Spielbeginn angezeigt.
      </p>
      <details>
        <summary class="cursor-pointer">Beispiel</summary>
        <WeekExample />
      </details>
    </section>
    <section class="py-2">
      <h2 class="py-4 font-bold text-l">Divisions und Superbowl</h2>
      <p>
        Divisions und Superbowl müssen vor dem Start des ersten Saisonspiels
        getippt werden.
      </p>
      <ul class="py-2 pl-12 list-disc list-outside">
        <li>Ein korrekter Tipp auf den Sieger einer Division gibt 7 Punkte.</li>
        <li>
          Ein korrekter Tipp auf den zweiten, dritten und vierten Platz einer
          Division gibt jeweils 1 Punkt.
        </li>
        <li>
          Wenn eine Division komplett richtig getippt wurde, gibt es 5
          Extrapunkte.
        </li>
        <li>
          Ein korrekter Tipp vor der Saison auf den Sieger des Superbowl gibt 20
          Punkte.
        </li>
      </ul>
      <details>
        <summary class="cursor-pointer">Beispiel</summary>
        <p class="pt-2">
          Angenommen die Division endet mit Bills &gt; Dolphins &gt; Patriots
          &gt; Jets.
        </p>
        <DivisionExample />
      </details>
    </section>
  </article>
);
