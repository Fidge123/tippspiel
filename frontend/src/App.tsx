import React from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";

import Button from "react-bootstrap/Button";
import { useAuth0 } from "@auth0/auth0-react";

import Leaderboard from "./Leaderboard";
import Schedule from "./Schedule";

function App() {
  const { isAuthenticated, loginWithRedirect, logout } = useAuth0();
  const returnTo = window.location.href;
  return (
    <div className="App">
      <header className="App-header">
        <span className="title">Tippspiel</span>
        {isAuthenticated ? (
          <Button onClick={() => logout({ returnTo })}>Log Out</Button>
        ) : (
          <Button onClick={() => loginWithRedirect()}>Log In</Button>
        )}
      </header>
      <section className="body">
        <Schedule></Schedule>
        {isAuthenticated ? (
          <Leaderboard></Leaderboard>
        ) : (
          <span>Please log in!</span>
        )}
      </section>
    </div>
  );
}

export default App;
