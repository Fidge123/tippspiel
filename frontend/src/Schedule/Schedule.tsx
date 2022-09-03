import { lazy, useEffect } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { weeksState, widthState } from "../State/states";

const Week = lazy(() => import("./Week"));

function Schedule() {
  const weeks = useRecoilValue(weeksState);
  const setInnerWidth = useSetRecoilState(widthState);

  useEffect(() => {
    function handleResize() {
      setInnerWidth(window.innerWidth);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setInnerWidth]);

  return (
    <div className="grid px-1 pb-8 gap-x-2 sm:gap-x-4 grid-cols-23 sm:grid-cols-27 md:grid-cols-45 gap-y-12 justify-items-center min-w-min">
      {weeks.map((week, i) => (
        <Week
          id={`${week.year}-${week.seasontype}-${week.week}`}
          week={week}
          key={`Week-${i}`}
        ></Week>
      ))}
    </div>
  );
}

export default Schedule;
