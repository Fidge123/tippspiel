import React from "react";
import "./App.css";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

import Leaderboard from "./Leaderboard/Leaderboard";
import Schedule from "./Schedule/Schedule";

function App() {
  const { isLoading, isAuthenticated, loginWithRedirect, logout } = useAuth0();
  const returnTo = window.location.href;

  return (
    <Router>
      <div className="App">
        <header className="header">
          <nav>
            <Link to="/">
              <span className="tippspiel">Tippspiel</span>
            </Link>
            <Link to="/leaderboard">
              <span>Leaderboard</span>
            </Link>
          </nav>
          {isLoading ? (
            <span className="loading">loading...</span>
          ) : isAuthenticated ? (
            <button onClick={() => logout({ returnTo })}>Log Out</button>
          ) : (
            <button onClick={() => loginWithRedirect()}>Log In</button>
          )}
        </header>
        <main>
          {isAuthenticated ? (
            <Switch>
              <Route path="/leaderboard">
                <Leaderboard></Leaderboard>
              </Route>
              <Route path="/">
                <Schedule></Schedule>
              </Route>
            </Switch>
          ) : (
            <p>Please log in!</p>
          )}
        </main>
      </div>
    </Router>
  );
}

export default App;
