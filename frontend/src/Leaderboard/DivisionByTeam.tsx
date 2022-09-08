import { useRecoilValue } from "recoil";
import { teamsState, divBetsByTeamState } from "../State/states";

function DivisionByTeam() {
  const teams = useRecoilValue(teamsState);
  const divBetsByTeam = useRecoilValue(divBetsByTeamState);
  const prefix = process.env.REACT_APP_IMG_URL;

  return (
    <table>
      <thead>
        <tr>
          <th>Team</th>
          <th>Erster</th>
          <th>Zweiter</th>
          <th>Dritter</th>
          <th>Vierter</th>
          <th>SB</th>
        </tr>
      </thead>
      <tbody>
        {[...teams]
          .sort((t1, t2) => t1.shortName.localeCompare(t2.shortName))
          .map((team) => (
            <tr key={team.id}>
              <td>
                <img
                  src={prefix + team.logo}
                  className={`p-1 inline-block`}
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
  );
}

export default DivisionByTeam;
