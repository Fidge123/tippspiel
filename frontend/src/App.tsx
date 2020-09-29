import React from "react";
import "./App.css";
import { useAuth0 } from "@auth0/auth0-react";

import Leaderboard from "./Leaderboard/Leaderboard";
import Schedule from "./Schedule/Schedule";

function App() {
  const { isLoading, isAuthenticated, loginWithRedirect, logout } = useAuth0();
  const returnTo = window.location.href;

  return (
    <div className="App">
      <header className="header">
        Tippspiel
        {isLoading ? (
          <span className="loading">loading...</span>
        ) : isAuthenticated ? (
          <button onClick={() => logout({ returnTo })}>Log Out</button>
        ) : (
          <button onClick={() => loginWithRedirect()}>Log In</button>
        )}
      </header>
      <main>
        {isAuthenticated ? <Leaderboard></Leaderboard> : <p>Please log in!</p>}
        <Schedule></Schedule>
      </main>
    </div>
  );
}

export default App;
