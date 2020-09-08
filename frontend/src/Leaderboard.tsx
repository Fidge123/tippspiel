import React from "react";
import "./Leaderboard.css";
import { useAuth0 } from "@auth0/auth0-react";

function Leaderboard() {
  const { user } = useAuth0();
  return (
    <ol>
      <li>{user.name}</li>
    </ol>
  );
}

export default Leaderboard;
