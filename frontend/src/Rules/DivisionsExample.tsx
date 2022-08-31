import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { Team } from "../Schedule/types";

import { divisionsState } from "../State/states";

function DivisionExample() {
  const division = useRecoilValue(divisionsState)[0];
  const [divisionBets, setDivisionBets] = useState<Team[]>(division.teams);
  const [score, setScore] = useState(0);
  const correctOrder = division.teams
    .map((t) => t.name)
    .sort((a, b) => a.localeCompare(b));

  useEffect(() => {
    let score = 0;
    if (divisionBets[0].name === correctOrder[0]) {
      score += 7;
    }
    if (divisionBets[1].name === correctOrder[1]) {
      score += 1;
    }
    if (divisionBets[2].name === correctOrder[2]) {
      score += 1;
    }
    if (divisionBets[3].name === correctOrder[3]) {
      score += 1;
    }
    if (score === 10) {
      score += 5;
    }
    setScore(score);
  }, [divisionBets, correctOrder]);

  return (
    <>
      <div className="w-min ml-4 py-4">
        {divisionBets.map((team, i) => (
          <div
            key={"Div" + team.id}
            className="team-l rounded flex justify-between items-center"
            style={{
              borderColor: `#${team?.color2}ff`,
              backgroundColor: `#${team?.color1}aa`,
              opacity: 1,
            }}
          >
            {team.logo && (
              <img
                src={process.env.REACT_APP_IMG_URL + team.logo}
                width="24"
                height="24"
                alt="logo home team"
                onError={(event: any) => (event.target.style.display = "none")}
              ></img>
            )}
            <span className="font-semibold text-gray-50">{team.name}</span>
            <span className="space-x-1">
              <button
                className="disabled:opacity-50"
                disabled={i === 0}
                onClick={() => {
                  setDivisionBets(
                    [...divisionBets].sort((a, b) => {
                      let aIndex = divisionBets.findIndex((c) => a.id === c.id);
                      let bIndex = divisionBets.findIndex((c) => c.id === b.id);
                      if (a.id === team.id) {
                        aIndex -= 1.1;
                      }
                      if (b.id === team.id) {
                        bIndex -= 1.1;
                      }
                      return aIndex - bIndex;
                    })
                  );
                }}
              >
                ⬆️
              </button>
              <button
                className="disabled:opacity-50"
                disabled={i === 3}
                onClick={() => {
                  setDivisionBets(
                    [...divisionBets].sort((a, b) => {
                      let aIndex = divisionBets.findIndex((c) => a.id === c.id);
                      let bIndex = divisionBets.findIndex((c) => c.id === b.id);
                      if (a.id === team.id) {
                        aIndex += 1.1;
                      }
                      if (b.id === team.id) {
                        bIndex += 1.1;
                      }
                      return aIndex - bIndex;
                    })
                  );
                }}
              >
                ⬇️
              </button>
            </span>
          </div>
        ))}
      </div>
      <div>Punkte: {score}</div>
    </>
  );
}

export default DivisionExample;
