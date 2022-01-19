import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
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
import Reset from "./Reset/Reset";
import TermsAndConditions from "./TermsAndConditions/TermsAndConditions";
import Verify from "./Verify/Verify";
import Impressum from "./Impressum/Impressum";
import Division from "./Division/Division";
import { tokenState } from "./State/states";

function App() {
  const [showRegister, setShowRegister] = useState(true);
  const [token, setToken] = useRecoilState(tokenState);

  const onHashChange = () =>
    setShowRegister(window.location.hash === "#/login");

  useEffect(() => {
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return (
    <Router>
      <div className="w-screen h-screen">
        <header className="h-12 w-screen px-4 fixed bg-gray-900 pointer-events-auto z-50 flex">
          <nav className="flex w-full items-center justify-between">
            <div>
              {token && (
                <Link to="/">
                  <span className="text-white font-semibold pr-4">
                    Tippspiel
                  </span>
                </Link>
              )}
              {token && (
                <Link to="/leaderboard">
                  <span className="text-white font-semibold pr-4">Tabelle</span>
                </Link>
              )}
              {token && (
                <Link to="/division">
                  <span className="text-white font-semibold pr-4">
                    Divisions
                  </span>
                </Link>
              )}
              {/* <Link to="/impressum">
                <span className="text-gray-200 font-light pr-4">Impressum</span>
              </Link>
              <Link to="/terms">
                <span className="text-gray-200 font-light pr-4">Nutzungsbedingungen</span>
              </Link> */}
            </div>
            <div>
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
        <main className="pt-12 dark:text-gray-100 min-h-full">
          <Switch>
            <Route path="/login">
              {token ? <Redirect to="/"></Redirect> : <Login></Login>}
            </Route>
            <Route path="/register">
              {token ? <Redirect to="/"></Redirect> : <Register></Register>}
            </Route>
            <Route path="/reset">
              <Reset></Reset>
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
            <Route path="/division">
              {token ? (
                <Division></Division>
              ) : (
                <Redirect to="/login"></Redirect>
              )}
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
