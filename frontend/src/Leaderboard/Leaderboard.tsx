import { useState, useEffect } from "react";
import "./Leaderboard.css";
import { BASE_URL } from "../api";
import { useToken } from "../useToken";

function Leaderboard() {
  const [token] = useToken();
  const [leaderboard, setLeaderboard] = useState<ILeaderboard[]>([]);

  useEffect(() => {
    (async () => {
      const response = await fetch(BASE_URL + "leaderboard/2021", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const res: LBResponse = await response.json();

      setLeaderboard(
        Object.entries(res)
          .map(([key, value]) => ({
            name: key,
            points: Object.values(value).reduce((a, b) => a + b),
            correct: Object.values(value).reduce(
              (a, b) => (b > 0 ? a + 1 : a),
              0
            ),
            total: Object.values(value).length,
          }))
          .sort((a, b) =>
            a.points === b.points ? b.total - a.total : b.points - a.points
          )
      );
    })();
  }, [token]);

  return (
    <div className="lb">
      <h2>Leaderboard</h2>

      <table>
        <thead className="lb-header">
          <tr>
            <th className="left">Platz</th>
            <th className="left">Name</th>
            <th className="center">Punkte</th>
            {/* <th>Aktuelle Woche</th> */}
            <th className="center">Tipps</th>
            <th className="center">Genauigkeit</th>
            {/* <th>Gesamtabstand</th> */}
            {/* <th>Abstand pro richtiger Tipp</th> */}
          </tr>
        </thead>
        <tbody className="lb-body">
          {leaderboard.map((l, i) => (
            <tr key={`LB-${l.name}`}>
              <td>{i + 1}</td>
              <td>{l.name}</td>
              <td className="center">{l.points}</td>
              {/* <td>AW</td> */}
              <td className="center">
                {l.correct}/{l.total}
              </td>
              <td className="center">
                {((l.correct / l.total) * 100).toFixed(2)} %
              </td>
              {/* <td>GA</td> */}
              {/* <td>AprT</td> */}
            </tr>
          ))}
        </tbody>
      </table>

      <p>
        Die Platzierung wird bestimmt durch die erzielten Punkte. Es gelten die
        folgenden Regeln bei der Punkteverteilung:
      </p>
      <ul>
        <li>Ein Tipp auf den Sieger eines Spiels gibt 2 Punkte</li>
        <li>
          Ein Tipp mit +- 0 / 3 / 6 Punkte Abstand zur korrekten
          Ergebnisdifferenz bekommt 3 / 2 / 1 Extrapunkte (nicht kumuluativ)
        </li>
        <li>Ein Tipp auf den Sieger der Division gibt 5 Punkte</li>
        <li>
          Der Tipp auf den Superbowltipp gibt 10 Punkte (zusätzlich zum
          eigentlich Match)
        </li>
        <li>
          Jeder Spieler kann wöchentlich ein Spiel auswählen was doppelte Punkte
          bringt
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
  total: number;
}

interface LBResponse {
  [name: string]: {
    [gameId: string]: number;
  };
}

export default Leaderboard;
