import { useState } from "react";

import OverviewTable from "./OverviewTable";
import DivisonTable from "./DivisionTable";
import ByTeam from "./ByTeam";
import ByPoints from "./ByPoints";
import ByWeek from "./ByWeek";
import DivisionByTeam from "./DivisionByTeam";

function Leaderboard() {
  const [openByWeek, setOpenByWeek] = useState(false);
  const [openByPoints, setOpenByPoints] = useState(false);
  const [openByTeam, setOpenByTeam] = useState(false);
  const [openDivByTeam, setOpenDivByTeam] = useState(false);

  return (
    <div className="p-4">
      <section className="w-full mb-8 space-y-4 overflow-x-auto">
        <h1 className="text-xl">Punktetabelle</h1>
        <OverviewTable></OverviewTable>
      </section>
      <section className="w-full mb-8 space-y-4 overflow-x-auto">
        <h1 className="text-xl">Pre-Season Tipps</h1>
        <p className="max-w-prose">
          Tipps für die Divisions werden zum Start der Post-Season für alle
          aufgedeckt. Icons mit grünem Rahmen sind korrekt und geben Punkte.
        </p>
        <DivisonTable></DivisonTable>
      </section>
      <section className="mb-8 space-y-4 overflow-x-auto w-max">
        <h1 className="text-xl">Statistik</h1>
        <p className="max-w-prose">
          Statistiken werden im Format "Korrekte Tipps - Falsche Tipps -
          Unentschieden" angezeigt. Es werden nur abgeschlossene Spiele in die
          Statistik einbezogen.
        </p>
        <article>
          <h1>Erfolg je Einsatz</h1>
          <button onClick={() => setOpenByPoints(!openByPoints)}>
            {openByPoints ? "verstecken" : "anzeigen"}
          </button>
          {openByPoints && <ByPoints></ByPoints>}
        </article>
        <article>
          <h1>Punkte je Woche</h1>
          <button onClick={() => setOpenByWeek(!openByWeek)}>
            {openByWeek ? "verstecken" : "anzeigen"}
          </button>
          {openByWeek && <ByWeek></ByWeek>}
        </article>
        <article>
          <h1>Punkte je Team</h1>
          <button onClick={() => setOpenByTeam(!openByTeam)}>
            {openByTeam ? "verstecken" : "anzeigen"}
          </button>
          {openByTeam && <ByTeam></ByTeam>}
        </article>
        <article>
          <h1>Division-Tipps je Team</h1>
          <button onClick={() => setOpenDivByTeam(!openDivByTeam)}>
            {openDivByTeam ? "verstecken" : "anzeigen"}
          </button>
          {openDivByTeam && <DivisionByTeam></DivisionByTeam>}
        </article>
      </section>
    </div>
  );
}

export default Leaderboard;
