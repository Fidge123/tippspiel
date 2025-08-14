export default async function Rules() {
  return (
    <main className="p-4">
      <h1 className="pb-4 font-bold text-xl">Regeln</h1>
      <p>
        Die Platzierung wird durch die erzielten Punkte bestimmt. Es gelten die
        folgenden Regeln bei der Punkteverteilung.
      </p>
      <section className="space-y-2 py-4">
        <h2 className="font-bold text-l">Reguläre Saison und Playoffs</h2>
        <p>Spiele müssen vor der offiziellen Startzeit getippt werden.</p>
        <ul className="list-outside list-disc pl-12">
          <li>Pro Tipp können zwischen 1 und 5 Punkte gesetzt werden.</li>
          <li>Der Einsatz wird gutgeschrieben wenn das Team gewinnt.</li>
          <li>Der Einsatz wird abgezogen wenn das Team verliert.</li>
          <li>
            Bei Unentschieden werden Punkte weder abgezogen noch gutgeschrieben.
          </li>
          <li>
            Wird ein Spiel nicht getippt, wird ein Punkt abgezogen, unabhängig
            vom Ergebnis.
          </li>
          <li>
            Wenn ein Drittel oder weniger der Tipps korrekt waren, wird den
            richtigen Tipps ein Extrapunkt gutgeschrieben.
          </li>
          <li>
            Jeder Spieler kann wöchentlich einen Doppler (🌟) durch Klick auf
            das "@" setzen. Der Doppler verdoppelt gutgeschriebene Punkte bei
            einem korrekten Tipp.
          </li>
        </ul>
        <p>
          Es kann zu jeder Zeit die Anzahl der eingetragenen Tipps pro Team
          gesehen werden. Die Namen und der Einsatz der Spieler wird nach
          Spielbeginn angezeigt.
        </p>
      </section>
      <section className="py-2">
        <h2 className="py-4 font-bold text-l">Divisions und Superbowl</h2>
        <p>
          Divisions und Superbowl müssen vor dem Start des ersten Saisonspiels
          getippt werden.
        </p>
        <ul className="list-outside list-disc py-2 pl-12">
          <li>
            Ein korrekter Tipp auf den Sieger einer Division gibt 7 Punkte.
          </li>
          <li>
            Ein korrekter Tipp auf den zweiten, dritten und vierten Platz einer
            Division gibt jeweils 1 Punkt.
          </li>
          <li>
            Wenn eine Division komplett richtig getippt wurde, gibt es 5
            Extrapunkte.
          </li>
          <li>
            Ein korrekter Tipp vor der Saison auf den Sieger des Superbowl gibt
            20 Punkte.
          </li>
        </ul>
      </section>
    </main>
  );
}
