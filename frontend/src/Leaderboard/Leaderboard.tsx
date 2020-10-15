import React, { useState, useCallback, useEffect } from "react";
import "./Leaderboard.css";
import { useAuth0 } from "@auth0/auth0-react";
import { BASE_URL } from "../api";

function Leaderboard() {
  const { isLoading, isAuthenticated, getAccessTokenSilently } = useAuth0();
  const [leaderboard, setLeaderboard] = useState<Leaderboard[]>([]);

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

      const response = await fetch(BASE_URL + "leaderboard/2020", {
        headers: await getAuthHeader("read:tipp"),
      });
      const res: LBResponse = await response.json();

      setLeaderboard(
        Object.entries(res)
          .map(([key, value]) => ({
            name: key,
            points: Object.values(value).reduce((a, b) => a + b),
          }))
          .sort((a, b) => b.points - a.points)
      );
    })();
  }, [isLoading, isAuthenticated, getAuthHeader]);

  return (
    <aside className="lb">
      <div>Leaderboard:</div>
      <ol>
        {leaderboard.map((l) => (
          <li key={`LB-${l.name}`}>
            {l.name} {l.points}
          </li>
        ))}
      </ol>
    </aside>
  );
}

interface Leaderboard {
  name: string;
  points: number;
}

interface LBResponse {
  [name: string]: {
    [gameId: string]: number;
  };
}

export default Leaderboard;
