import { useState, useEffect } from "react";
import { useRecoilValue } from "recoil";

import { tokenState } from "../State/states";
import { BASE_URL, fetchFromAPI } from "../api";

function sum(list: number[]) {
  return list.reduce((a, b) => a + b, 0);
}

function Leaderboard() {
  const token = useRecoilValue(tokenState);
  const [leaderboard, setLeaderboard] = useState<ILeaderboard[]>([]);

  function formatBet(bet: any) {
    return {
      logo: bet?.team?.logo
        ? process.env.REACT_APP_IMG_URL + bet?.team?.logo
        : null,
      points: bet?.points || 0,
    };
  }

  useEffect(() => {
    (async () => {
      const res: LBResponse[] = await fetchFromAPI("leaderboard/2021", token); //TODO

      setLeaderboard(
        res
          .map((user) => ({
            name: user.user,
            points:
              user.bets.reduce((prev, { points }) => prev + sum(points), 0) +
              user.divBets.reduce((p, c) => p + c.points, 0) +
              user.sbBet.points,
            correct: user.bets.reduce(
              (a, b) => (b.points[0] > 0 ? a + 1 : a),
              0
            ),
            exact: user.bets.reduce((a, b) => (b.points[1] > 0 ? a + 1 : a), 0),
            offThree: user.bets.reduce(
              (a, b) => (b.points[2] > 0 ? a + 1 : a),
              0
            ),
            offSix: user.bets.reduce(
              (a, b) => (b.points[3] > 0 ? a + 1 : a),
              0
            ),
            doubler: user.bets.reduce(
              (a, b) =>
                b.points[0] === 4
                  ? a + b.points.reduce((a, b) => a + b) / 2
                  : a,
              0
            ),
            total: user.bets.length,
            divBets: [
              formatBet(user.divBets.find((bet) => bet.name === "AFC North")),
              formatBet(user.divBets.find((bet) => bet.name === "AFC South")),
              formatBet(user.divBets.find((bet) => bet.name === "AFC West")),
              formatBet(user.divBets.find((bet) => bet.name === "AFC East")),
              formatBet(user.divBets.find((bet) => bet.name === "NFC North")),
              formatBet(user.divBets.find((bet) => bet.name === "NFC South")),
              formatBet(user.divBets.find((bet) => bet.name === "NFC West")),
              formatBet(user.divBets.find((bet) => bet.name === "NFC East")),
            ],
            sbBet: formatBet(user.sbBet),
          }))
          .sort((a, b) =>
            a.points === b.points ? b.total - a.total : b.points - a.points
          )
      );
    })();
  }, [token]);

  return (
    <div className="p-4 pt-0">
      <h2 className="text-xl">Leaderboard</h2>

      <div className="mt-4 mb-12 w-full overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th className="pr-2 pt-2 text-left"></th>
              <th className="pr-2 pt-2 text-left">Name</th>
              <th className="pr-2 pt-2 text-center">Punkte</th>
              <th className="pr-2 pt-2 text-center">Sieger</th>
              <th className="pr-2 pt-2 text-center">+-0</th>
              <th className="pr-2 pt-2 text-center">+-3</th>
              <th className="pr-2 pt-2 text-center">+-6</th>
              <th className="pr-2 pt-2 text-center">🌟</th>
            </tr>
          </thead>
          <tbody className="lb-body">
            {leaderboard.map((l, i, lb) => (
              <tr key={`LB-${l.name}`}>
                <td className="pr-2 pt-2">
                  {i && lb[i - 1].points === lb[i].points ? "" : `${i + 1}.`}
                </td>
                <td className="pr-2 pt-2">{l.name}</td>
                <td className="pr-2 pt-2 text-center">{l.points}</td>
                <td className="pr-2 pt-2 text-center">
                  {l.correct}/{l.total}
                  <br />
                  {((l.correct / l.total) * 100).toFixed(0)}%
                </td>
                <td className="pr-2 pt-2 text-center">
                  {l.exact}/{l.total}
                  <br /> {((l.exact / l.total) * 100).toFixed(0)}%
                </td>
                <td className="pr-2 pt-2 text-center">
                  {l.offThree}/{l.total}
                  <br />
                  {((l.offThree / l.total) * 100).toFixed(0)}%
                </td>
                <td className="pr-2 pt-2 text-center">
                  {l.offSix}/{l.total}
                  <br /> {((l.offSix / l.total) * 100).toFixed(0)}%
                </td>
                <td className="pr-2 pt-2 text-center">{l.doubler}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 mb-12 w-full overflow-x-auto">
        <table>
          <thead className="lb-header">
            <tr>
              <th className="left">Name</th>
              <th className="center px-2">AFC North</th>
              <th className="center px-2">AFC South</th>
              <th className="center px-2">AFC West</th>
              <th className="center px-2">AFC East</th>
              <th className="center px-2">NFC North</th>
              <th className="center px-2">NFC South</th>
              <th className="center px-2">NFC West</th>
              <th className="center px-2">NFC East</th>
              <th className="center px-2">SB</th>
              <th className="center px-2">Points</th>
            </tr>
          </thead>
          <tbody className="lb-body">
            {leaderboard.map((l) => (
              <tr key={`LB-${l.name}`}>
                <td className="pr-2 pt-2">{l.name}</td>
                {l.divBets.map((bet, i) => (
                  <td key={"divbet" + i} className="p-1 pt-2 text-center">
                    {bet?.logo && (
                      <img
                        src={bet?.logo}
                        className={`h-8 w-8 p-1 inline-block border rounded ${
                          bet.points ? "border-green-500" : "border-red-500"
                        }`}
                        alt="team logo for division bet"
                        onError={(event: any) =>
                          (event.target.style.display = "none")
                        }
                      ></img>
                    )}
                    {bet?.logo === null && "?"}
                  </td>
                ))}
                <td className="p-1 pt-2 text-center">
                  {l.sbBet?.logo && (
                    <img
                      src={l.sbBet?.logo}
                      className={`h-8 w-8 p-1 inline-block border rounded ${
                        l.sbBet.points ? "border-green-500" : "border-red-500"
                      }`}
                      alt="team logo for superbowl bet"
                      onError={(event: any) =>
                        (event.target.style.display = "none")
                      }
                    ></img>
                  )}
                  {l.sbBet?.logo === null && "?"}
                </td>
                <td className="cpr-2 pt-2 text-center">
                  {l.divBets.reduce((p, c) => p + c.points, 0) + l.sbBet.points}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        Die Platzierung wird bestimmt durch die erzielten Punkte. Es gelten die
        folgenden Regeln bei der Punkteverteilung:
      </p>
      <ul className="list-disc list-outside pl-12 py-4">
        <li>Ein Tipp auf den Sieger eines Spiels gibt 2 Punkte</li>
        <li>
          Ein Tipp mit +- 0 / 3 / 6 Punkte Abstand zur korrekten
          Ergebnisdifferenz bekommt 3 / 2 / 1 Extrapunkte (nicht kumuluativ)
        </li>
        <li>Ein Tipp auf den Sieger der Division gibt 5 Punkte</li>
        <li>
          Der Tipp auf den Superbowlsieger gibt 10 Punkte (zusätzlich zum
          eigentlich Match)
        </li>
        <li>
          Jeder Spieler kann wöchentlich ein Spiel auswählen, welches doppelte
          Punkte bringt
        </li>
      </ul>
      <p>
        Spiele müssen vor der offiziellen Startzeit getippt werden. Sieger der
        Divisions und des Superbowls müssen vor dem ersten Sonntagsspiel der
        Saison getippt werden.
      </p>
    </div>
  );
}

interface ILeaderboard {
  name: string;
  points: number;
  correct: number;
  exact: number;
  offThree: number;
  offSix: number;
  doubler: number;
  total: number;
  divBets: {
    logo: string;
    points: number;
  }[];
  sbBet: {
    logo: string;
    points: number;
  };
}

interface LBResponse {
  user: string;
  bets: {
    id: string;
    points: number[];
  }[];
  divBets: {
    name: string;
    points: number;
    team: {
      id: string;
      name: string;
      abbreviation: string;
      logo: string;
      playoffSeed: number;
    };
  }[];
  sbBet: {
    points: number;
    team: {
      id: string;
      name: string;
      abbreviation: string;
      logo: string;
      playoffSeed: number;
    };
  };
}

export default Leaderboard;
