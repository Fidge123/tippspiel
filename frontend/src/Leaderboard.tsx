import React, { useState, useCallback, useEffect } from "react";
import "./Leaderboard.css";
import { useAuth0 } from "@auth0/auth0-react";

const BASE_URL = "https://nfl-tippspiel.herokuapp.com/";
// const BASE_URL = "http://localhost:5000/";

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
    (scope: string) => {
      try {
        const token = getAccessTokenSilently({
          audience: "https://nfl-tippspiel.herokuapp.com/auth",
          scope,
        });
        if (authError || !token) {
          throw Error("Error getting Token!");
        }
        return token;
      } catch (e) {
        return getAccessTokenWithPopup({
          audience: "https://nfl-tippspiel.herokuapp.com/auth",
          scope,
        });
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
        Object.entries(res).map(([key, value]) => ({
          name: key,
          points: Object.values(value).reduce((a, b) => a + b),
        }))
      );
    })();
  }, [isLoading, isAuthenticated, getAccessToken]);

  return (
    <div className="lbParent">
      <div>Leaderboard:</div>
      <ol>
        {leaderboard.map((l) => (
          <li>
            {l.name} {l.points}
          </li>
        ))}
      </ol>
    </div>
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
