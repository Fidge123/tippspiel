import React from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";

import Button from "react-bootstrap/Button";
import { useAuth0 } from "@auth0/auth0-react";

import Leaderboard from "./Leaderboard/Leaderboard";
import Schedule from "./Schedule/Schedule";

function App() {
  const { isLoading, isAuthenticated, loginWithRedirect, logout } = useAuth0();
  const returnTo = window.location.href;

  return (
    <div className="App">
      <header className="header">
        <span>Tippspiel</span>
        {isLoading ? (
          <span className="loading">loading...</span>
        ) : isAuthenticated ? (
          <Button size="sm" onClick={() => logout({ returnTo })}>
            Log Out
          </Button>
        ) : (
          <Button size="sm" onClick={() => loginWithRedirect()}>
            Log In
          </Button>
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
