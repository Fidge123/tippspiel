import { useRecoilValue } from "recoil";
import { divisionsState, divBetsByTeamState } from "../State/states";

function DivisionByTeam() {
  const division = useRecoilValue(divisionsState);
  const divBetsByTeam = useRecoilValue(divBetsByTeamState);
  const prefix = process.env.REACT_APP_IMG_URL;

  return (
    <>
      {division.map((div) => (
        <table key={div.name} className="table-fixed">
          <thead>
            <tr className="thead">
              <th>{div.name}</th>
              <th className="w-12 sm:hidden">1.</th>
              <th className="w-12 sm:hidden">2.</th>
              <th className="w-12 sm:hidden">3.</th>
              <th className="w-12 sm:hidden">4.</th>
              <th className="hidden w-20 sm:table-cell">Erster</th>
              <th className="hidden w-20 sm:table-cell">Zweiter</th>
              <th className="hidden w-20 sm:table-cell">Dritter</th>
              <th className="hidden w-20 sm:table-cell">Vierter</th>
              <th className="w-12 sm:w-20">SB</th>
            </tr>
          </thead>
          <tbody>
            {[...div.teams]
              .sort((t1, t2) => t1.playoffSeed - t2.playoffSeed)
              .map((team) => (
                <tr key={team.id}>
                  <td className="w-32 truncate sm:w-36 md:w-40">
                    <img
                      src={prefix + team.logo}
                      className="inline-block p-1"
                      width="32"
                      height="32"
                      alt={team.name}
                      onError={(event: any) =>
                        (event.target.style.display = "none")
                      }
                    ></img>
                    {team.shortName}
                  </td>
                  <td>
                    {divBetsByTeam.division.reduce(
                      (count, { first }) =>
                        first.id === team.id ? count + 1 : count,
                      0
                    )}
                  </td>
                  <td>
                    {divBetsByTeam.division.reduce(
                      (count, { second }) =>
                        second.id === team.id ? count + 1 : count,
                      0
                    )}
                  </td>
                  <td>
                    {divBetsByTeam.division.reduce(
                      (count, { third }) =>
                        third.id === team.id ? count + 1 : count,
                      0
                    )}
                  </td>
                  <td>
                    {divBetsByTeam.division.reduce(
                      (count, { fourth }) =>
                        fourth.id === team.id ? count + 1 : count,
                      0
                    )}
                  </td>
                  <td>
                    {divBetsByTeam.sb.reduce(
                      (count, { team: t }) =>
                        t.id === team.id ? count + 1 : count,
                      0
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      ))}
    </>
  );
}

export default DivisionByTeam;
