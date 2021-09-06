import { useEffect, useState } from "react";
import "./App.css";
import {
  HashRouter as Router,
  Switch,
  Route,
  Link,
  Redirect,
} from "react-router-dom";

import Leaderboard from "./Leaderboard/Leaderboard";
import Schedule from "./Schedule/Schedule";
import Login from "./Login/Login";
import Register from "./Register/Register";
import TermsAndConditions from "./TermsAndConditions/TermsAndConditions";
import Verify from "./Verify/Verify";
import Impressum from "./Impressum/Impressum";
import { useToken } from "./useToken";

function App() {
  const [token, setToken] = useToken();
  const [showRegister, setShowRegister] = useState(true);

  const onHashChange = () =>
    setShowRegister(window.location.hash === "#/login");

  useEffect(() => {
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return (
    <Router>
      <div className="App">
        <header className="header">
          <nav>
            <div className="left">
              {token && (
                <Link to="/">
                  <span className="tippspiel">Tippspiel</span>
                </Link>
              )}
              {token && (
                <Link to="/leaderboard">
                  <span className="tippspiel">Tabelle</span>
                </Link>
              )}
              {/* <Link to="/impressum">
                <span className="light">Impressum</span>
              </Link>
              <Link to="/terms">
                <span className="light">Nutzungsbedingungen</span>
              </Link> */}
            </div>
            <div className="right">
              {token ? (
                <button onClick={() => setToken("")}>Ausloggen</button>
              ) : showRegister ? (
                <Link to="/register">
                  <button>Registrieren</button>
                </Link>
              ) : (
                <Link to="/login">
                  <button>Einloggen</button>
                </Link>
              )}
            </div>
          </nav>
        </header>
        <main>
          <Switch>
            <Route path="/login">
              {token ? (
                <Redirect to="/"></Redirect>
              ) : (
                <Login setToken={setToken}></Login>
              )}
            </Route>
            <Route path="/register">
              {token ? <Redirect to="/"></Redirect> : <Register></Register>}
            </Route>
            <Route path="/verify">
              <Verify></Verify>
            </Route>
            <Route path="/impressum">
              <Impressum></Impressum>
            </Route>
            <Route path="/terms">
              <TermsAndConditions></TermsAndConditions>
            </Route>
            <Route path="/leaderboard">
              {token ? (
                <Leaderboard></Leaderboard>
              ) : (
                <Redirect to="/login"></Redirect>
              )}
            </Route>
            <Route path="/">
              {token ? (
                <Schedule></Schedule>
              ) : (
                <Redirect to="/login"></Redirect>
              )}
            </Route>
            <Route path="*">
              <Redirect to="/"></Redirect>
            </Route>
          </Switch>
        </main>
      </div>
    </Router>
  );
}

export default App;
