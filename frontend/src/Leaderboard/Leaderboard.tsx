import React, { useState, useCallback, useEffect } from "react";
import "./Leaderboard.css";
import { useAuth0 } from "@auth0/auth0-react";
import { BASE_URL } from "../api";

function Leaderboard() {
  const {
    isLoading,
    isAuthenticated,
    getAccessTokenSilently,
    getAccessTokenWithPopup,
    error: authError,
  } = useAuth0();

  const [leaderboard, setLeaderboard] = useState<Leaderboard[]>([]);

  const getAccessToken = useCallback(
    async (scope: string) => {
      try {
        const token = await getAccessTokenSilently({ scope });
        if (authError || !token) {
          throw Error("Error getting Token!");
        }
        return token;
      } catch (e) {
        return getAccessTokenWithPopup({ scope });
      }
    },
    [authError, getAccessTokenSilently, getAccessTokenWithPopup]
  );

  useEffect(() => {
    (async () => {
      if (isLoading || !isAuthenticated) {
        return;
      }

      const token = await getAccessToken("read:tipp");
      const response = await fetch(BASE_URL + "leaderboard/2020", {
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
          }))
          .sort((a, b) => b.points - a.points)
      );
    })();
  }, [isLoading, isAuthenticated, getAccessToken]);

  return (
    <aside className="leaderboard">
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
