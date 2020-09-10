import React from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";

import Button from "react-bootstrap/Button";
import { useAuth0 } from "@auth0/auth0-react";

// import Leaderboard from "./Leaderboard";
import Schedule from "./Schedule";

function App() {
  const { isAuthenticated, loginWithRedirect, logout } = useAuth0();
  const returnTo = window.location.href;
  return (
    <div className="App">
      <header className="App-header">
        <span className="title">Tippspiel</span>
        {isAuthenticated ? (
          <Button size="sm" onClick={() => logout({ returnTo })}>
            Log Out
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={() =>
              loginWithRedirect({
                audience: "https://nfl-tippspiel.herokuapp.com/auth",
              })
            }
          >
            Log In
          </Button>
        )}
      </header>
      {/* <aside className="leaderboard">
        {isAuthenticated ? (
          <Leaderboard></Leaderboard>
        ) : (
          <span>Please log in!</span>
        )}
      </aside> */}
      <section className="schedule">
        <Schedule></Schedule>
      </section>
    </div>
  );
}

export default App;
