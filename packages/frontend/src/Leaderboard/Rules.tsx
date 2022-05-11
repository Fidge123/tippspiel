export default function Rules() {
  return (
    <>
      <p>
        Die Platzierung wird durch die erzielten Punkte bestimmt. Es gelten die
        folgenden Regeln bei der Punkteverteilung:
      </p>
      <ul className="list-disc list-outside pl-12 py-4">
        <li>Ein korrekter Tipp auf den Sieger eines Spiels gibt 2 Punkte</li>
        <li>
          Ein Tipp mit 0 / 3 / 6 Punkte Abstand zur korrekten Ergebnisdifferenz
          bekommt 3 / 2 / 1 Extrapunkte (nicht kumuluativ)
        </li>
        <li>Ein korrekter Tipp auf den Sieger einer Division gibt 5 Punkte</li>
        <li>
          Ein korrekter Tipp auf den Superbowlsieger gibt 10 Punkte (zusätzlich
          zum eigentlich Match)
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
