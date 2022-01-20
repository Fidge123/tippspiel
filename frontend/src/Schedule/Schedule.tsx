import { useRecoilValue } from "recoil";
import Week from "./Week";
import { weeksState } from "../State/states";

function Schedule() {
  const weeks = useRecoilValue(weeksState);

  return (
    <section className="grid gap-x-2 sm:gap-x-4 grid-cols-23 sm:grid-cols-27 md:grid-cols-45 gap-y-12 justify-items-center px-1 pb-8 min-w-min">
      {weeks.map((week, i) => (
        <Week week={week} key={`Week-${i}`}></Week>
      ))}
    </section>
  );
}

export default Schedule;
