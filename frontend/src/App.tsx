import { Suspense, lazy } from "react";
import {
  Route,
  Link,
  Routes,
  Navigate,
  useLocation,
  NavLink,
} from "react-router-dom";

import { LoggedInRoute, LoggedOutRoute } from "./PrivateRoute";
import { ErrorBoundary } from "react-error-boundary";
import Hamburger from "./Hamburger";
import { isLoggedIn } from "./api";

const Leaderboard = lazy(() => import("./Leaderboard/Leaderboard"));
const Schedule = lazy(() => import("./Schedule/Schedule"));
const Login = lazy(() => import("./Login/Login"));
const Register = lazy(() => import("./Register/Register"));
const Reset = lazy(() => import("./Reset/Reset"));
const Verify = lazy(() => import("./Verify/Verify"));
const Impressum = lazy(() => import("./Impressum/Impressum"));
const Account = lazy(() => import("./Account/Account"));
const Leagues = lazy(() => import("./Leagues/Leagues"));
const DivisionAndSbBet = lazy(() => import("./Division/DivisionAndSbBet"));
const Rules = lazy(() => import("./Rules/Rules"));

function Placeholder() {
  return (
    <div className="flex flex-col items-center justify-center w-screen h-60">
      <p className="p-4">Ein Fehler ist aufgetreten.</p>
      <button onClick={() => window.location.reload()}>Seite neu laden</button>
    </div>
  );
}

function App() {
  const loggedIn = isLoggedIn();
  const location = useLocation();

  return (
    <div className="w-screen h-screen">
      <div className="fixed z-50 flex items-center justify-between w-screen h-12 px-4 bg-gray-900 pointer-events-auto">
        <nav className="w-full space-x-4 font-semibold text-white">
          {loggedIn ? (
            <>
              <NavLink to="/">Tippspiel</NavLink>
              <NavLink to="/leaderboard">Tabelle</NavLink>
              <NavLink to="/division">Divisions</NavLink>
            </>
          ) : (
            ""
          )}
        </nav>
        {loggedIn ? (
          <Hamburger />
        ) : location.pathname === "/login" ? (
          <Link to="/register">
            <button>Registrieren</button>
          </Link>
        ) : (
          <Link to="/login">
            <button>Einloggen</button>
          </Link>
        )}
      </div>
      <div className="min-h-full pt-12 dark:text-gray-100">
        <ErrorBoundary FallbackComponent={Placeholder} resetKeys={[location]}>
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              <Route
                path="/login"
                element={
                  <LoggedOutRoute>
                    <Login></Login>
                  </LoggedOutRoute>
                }
              ></Route>
              <Route
                path="/register"
                element={
                  <LoggedOutRoute>
                    <Register></Register>
                  </LoggedOutRoute>
                }
              ></Route>
              <Route
                path="/reset"
                element={
                  <LoggedOutRoute>
                    <Reset></Reset>
                  </LoggedOutRoute>
                }
              ></Route>
              <Route
                path="/verify"
                element={
                  <LoggedOutRoute>
                    <Verify></Verify>
                  </LoggedOutRoute>
                }
              ></Route>
              <Route
                path="/impressum"
                element={<Impressum></Impressum>}
              ></Route>
              <Route
                path="/account"
                element={
                  <LoggedInRoute>
                    <Account></Account>
                  </LoggedInRoute>
                }
              ></Route>
              <Route
                path="/leagues"
                element={
                  <LoggedInRoute>
                    <Leagues></Leagues>
                  </LoggedInRoute>
                }
              ></Route>
              <Route
                path="/rules"
                element={
                  <LoggedInRoute>
                    <Rules></Rules>
                  </LoggedInRoute>
                }
              ></Route>
              <Route
                path="/division"
                element={
                  <LoggedInRoute>
                    <DivisionAndSbBet></DivisionAndSbBet>
                  </LoggedInRoute>
                }
              ></Route>
              <Route
                path="/leaderboard"
                element={
                  <LoggedInRoute>
                    <Leaderboard></Leaderboard>
                  </LoggedInRoute>
                }
              ></Route>
              <Route
                path="/"
                element={
                  <LoggedInRoute>
                    <Schedule></Schedule>
                  </LoggedInRoute>
                }
              ></Route>
              <Route
                path="*"
                element={<Navigate to="/" replace></Navigate>}
              ></Route>
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  );
}

export default App;
