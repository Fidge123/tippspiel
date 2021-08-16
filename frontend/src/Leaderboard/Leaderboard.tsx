import React, { useState, useCallback, useEffect } from "react";
import "./Leaderboard.css";
import { useAuth0 } from "@auth0/auth0-react";
import { BASE_URL } from "../api";

function Leaderboard() {
  const { isLoading, isAuthenticated, getAccessTokenSilently } = useAuth0();
  const [leaderboard, setLeaderboard] = useState<ILeaderboard[]>([]);

  const getAuthHeader = useCallback(
    async (scope: string): Promise<{ Authorization: string }> => {
      return {
        Authorization: `Bearer ${await getAccessTokenSilently({ scope })}`,
      };
    },
    [getAccessTokenSilently]
  );

  useEffect(() => {
    (async () => {
      if (isLoading || !isAuthenticated) {
        return;
      }

      const response = await fetch(BASE_URL + "leaderboard/2021", {
        headers: await getAuthHeader("read:bet"),
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
  }, [isLoading, isAuthenticated, getAuthHeader]);

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
        <li>Ein Tipp auf das richtige Team gibt 1 Punkt</li>
        <li>
          Der Tipp mit dem geringsten Abstand zum tatsächlichen Ergebnis bekommt
          3 Extrapunkte, der nächstbeste Tipp 2 Extrapunkte, usw.
        </li>
        <li>
          Bei Tipps mit gleichem Abstand erhalten beide Tipps die vollen
          Extrapunkte und die Anzahl der Extrapunkte für den nächstbesten Tipp
          verringert sich um die Anzahl der Tipps mit gleichem Abstand
        </li>
      </ul>
      <p>Bei einem Gleichstand der Punkte werden folgende Aspekte gewertet:</p>
      <ul>
        <li>Höhere Anzahl korrekter Tipps</li>
        <li>
          Niedriger Abstand zu den tatsächlichen Spielergebnissen bei korrekten
          Tipps
        </li>
      </ul>
      <p>
        Falls danach kein klarer Sieger bestimmt ist, teilen sich die Spieler
        den Platz.
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
