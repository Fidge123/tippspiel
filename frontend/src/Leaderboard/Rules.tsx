export default function Rules() {
  return (
    <>
      <p>
        Die Platzierung wird durch die erzielten Punkte bestimmt. Es gelten die
        folgenden Regeln bei der Punkteverteilung:
      </p>
      <ul className="list-disc list-outside pl-12 py-4">
        <li>Pro Tipp können zwischen 1 und 5 Punkte gesetzt werden</li>
        <li>Der Einsatz wird gutgeschrieben wenn das Team gewinnt</li>
        <li>Der Einsatz wird abgezogen wenn das Team verliert</li>
        <li>Bei Unendschieden Punkte weder abgezogen noch gutgeschrieben</li>
        <li>
          Wird ein Spiel nicht getippt, verliert man automatisch einen Punkt
        </li>
        <li>Ein korrekter Tipp auf den Sieger einer Division gibt 5 Punkte</li>
        <li>
          Ein korrekter Tipp auf den Superbowlsieger gibt 10 Punkte (zusätzlich
          zum eigentlichen Match)
        </li>
        <li>
          Jeder Spieler kann wöchentlich ein Spiel auswählen, welches doppelte
          Punkte bringt.
        </li>
      </ul>
      <p>
        Spiele müssen vor der offiziellen Startzeit getippt werden. Sieger der
        Divisions und des Superbowls müssen vor dem ersten Sonntagsspiel der
        Saison getippt werden.
      </p>
    </>
  );
}
