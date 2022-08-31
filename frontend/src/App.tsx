import { Suspense, lazy, useEffect } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import {
  Route,
  Link,
  Routes,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";

import { tokenState } from "./State/states";
import { LoggedInRoute, LoggedOutRoute } from "./PrivateRoute";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";
import { refresh } from "./api";

const Leaderboard = lazy(() => import("./Leaderboard/Leaderboard"));
const Schedule = lazy(() => import("./Schedule/Schedule"));
const Login = lazy(() => import("./Login/Login"));
const Register = lazy(() => import("./Register/Register"));
const Reset = lazy(() => import("./Reset/Reset"));
const Verify = lazy(() => import("./Verify/Verify"));
const Impressum = lazy(() => import("./Impressum/Impressum"));
const Division = lazy(() => import("./Division/Division"));
const Rules = lazy(() => import("./Rules/Rules"));

function Placeholder({ resetErrorBoundary }: FallbackProps) {
  const setToken = useSetRecoilState(tokenState);
  useEffect(() => {
    (async () => {
      setToken(await refresh());
      resetErrorBoundary();
    })();
  }, [setToken, resetErrorBoundary]);
  return <div>Error!</div>;
}

function App() {
  const [token, setToken] = useRecoilState(tokenState);
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="w-screen h-screen">
      <header className="h-12 w-screen px-4 fixed bg-gray-900 pointer-events-auto z-50 flex items-center justify-between">
        <nav className="w-full text-white font-semibold">
          {token ? (
            <>
              <Link to="/">
                <h1 className="inline pr-4">Tippspiel</h1>
              </Link>
              <Link to="/leaderboard">
                <h2 className="inline pr-4">Tabelle</h2>
              </Link>
              <Link to="/division">
                <h2 className="inline pr-4">Divisions</h2>
              </Link>
              <Link to="/rules">
                <h2 className="inline pr-4">Rules</h2>
              </Link>
            </>
          ) : (
            ""
          )}
        </nav>
        {token ? (
          <button
            onClick={() => {
              setToken("");
              navigate("/login", { replace: true });
            }}
          >
            Ausloggen
          </button>
        ) : location.pathname === "/login" ? (
          <Link to="/register">
            <button>Registrieren</button>
          </Link>
        ) : (
          <Link to="/login">
            <button>Einloggen</button>
          </Link>
        )}
      </header>
      <div className="pt-12 dark:text-gray-100 min-h-full">
        <ErrorBoundary FallbackComponent={Placeholder}>
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
              <Route path="/rules" element={<Rules></Rules>}></Route>
              <Route
                path="/division"
                element={
                  <LoggedInRoute>
                    <Division></Division>
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
