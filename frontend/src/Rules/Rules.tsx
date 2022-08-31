import DivisionExample from "./DivisionsExample";
import WeekExample from "./WeekExample";

export default function Rules() {
  return (
    <article className="p-4">
      <h1 className="text-xl font-bold pb-4">Regeln</h1>
      <p>
        Die Platzierung wird durch die erzielten Punkte bestimmt. Es gelten die
        folgenden Regeln bei der Punkteverteilung.
      </p>
      <section className="py-4">
        <h2 className="text-l font-bold py-4">Reguläre Saison und Playoffs</h2>
        <p>Spiele müssen vor der offiziellen Startzeit getippt werden.</p>
        <ul className="list-disc list-outside pl-12 py-2">
          <li>Pro Tipp können zwischen 1 und 5 Punkte gesetzt werden</li>
          <li>Der Einsatz wird gutgeschrieben wenn das Team gewinnt</li>
          <li>Der Einsatz wird abgezogen wenn das Team verliert</li>
          <li>Bei Unendschieden Punkte weder abgezogen noch gutgeschrieben</li>
          <li>
            Wird ein Spiel nicht getippt, verliert man automatisch einen Punkt
          </li>
          <li>
            Jeder Spieler kann wöchentlich ein Spiel auswählen, welches doppelte
            Punkte bringt.
          </li>
        </ul>
        <p>
          Es kann zu jeder Zeit die Anzahl der eingetragenen Tipps pro Team
          gesehen werden. Die Namen und der Einsatz der Spieler wird nach
          Spielbeginn angezeigt.
        </p>
        <h3 className="font-bold py-4">Interaktives Beispiel</h3>
        <WeekExample></WeekExample>
      </section>
      <section className="py-2">
        <h2 className="text-l font-bold py-4">Division und Superbowl</h2>
        <p>
          Division und Superbowl müssen vor dem Start des ersten Sonntagsspiel
          getippt werden
        </p>
        <ul className="list-disc list-outside pl-12 py-2">
          <li>
            Ein korrekter Tipp auf den Sieger einer Division gibt 7 Punkte
          </li>
          <li>
            Ein korrekter Tipp auf den zweiten, dritten und vierten Platz einer
            Division gibt jeweils 1 Punkt
          </li>
          <li>
            Wenn eine Division komplett richtig getippt wurde, gibt es 5
            Extrapunkte
          </li>
          <li>
            Ein korrekter Tipp auf den Superbowlsieger gibt 20 Punkte
            (zusätzlich zum eigentlichen Match)
          </li>
        </ul>
        <h3 className="font-bold py-4">Interaktives Beispiel</h3>
        <p>
          Angenommen die Division endet mit Bills &gt; Dolphins &gt; Patriots
          &gt; Jets
        </p>
        <DivisionExample></DivisionExample>
      </section>
    </article>
  );
}
