import { useState } from "react";

import OverviewTable from "./OverviewTable";
import DivisonTable from "./DivisionTable";
import ByTeam from "./ByTeam";
import ByPoints from "./ByPoints";
import ByWeek from "./ByWeek";

function Leaderboard() {
  const [openByWeek, setOpenByWeek] = useState(false);
  const [openByPoints, setOpenByPoints] = useState(false);
  const [openByTeam, setOpenByTeam] = useState(false);

  return (
    <div className="p-4">
      <section className="w-full mb-8 overflow-x-auto">
        <h1 className="mb-4 text-xl">Punktetabelle</h1>
        <OverviewTable></OverviewTable>
      </section>
      <section className="w-full mb-8 overflow-x-auto">
        <h1 className="mb-4 text-xl">Pre-Season Tipps</h1>
        <DivisonTable></DivisonTable>
      </section>
      <section className="w-full mb-8 space-y-4 overflow-x-auto">
        <h1 className="mb-4 text-xl">Statistik</h1>
        <article>
          <h1>Punkte je Woche</h1>
          <button onClick={() => setOpenByWeek(!openByWeek)}>
            {openByWeek ? "verstecken" : "anzeigen"}
          </button>
          {openByWeek && <ByWeek></ByWeek>}
        </article>
        <article>
          <h1>Erfolg je Einsatz</h1>
          <button onClick={() => setOpenByPoints(!openByPoints)}>
            {openByPoints ? "verstecken" : "anzeigen"}
          </button>
          {openByPoints && <ByPoints></ByPoints>}
        </article>
        <article>
          <h1>Punkte je Team</h1>
          <button onClick={() => setOpenByTeam(!openByTeam)}>
            {openByTeam ? "verstecken" : "anzeigen"}
          </button>
          {openByTeam && <ByTeam></ByTeam>}
        </article>
      </section>
    </div>
  );
}

export default Leaderboard;
