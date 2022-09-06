import OverviewTable from "./OverviewTable";
import DivisonTable from "./DivisionTable";

function Leaderboard() {
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
    </div>
  );
}

export default Leaderboard;
