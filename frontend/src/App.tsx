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
const TermsAndConditions = lazy(() => import("./T&C/TermsAndConditions"));
const Verify = lazy(() => import("./Verify/Verify"));
const Impressum = lazy(() => import("./Impressum/Impressum"));
const Division = lazy(() => import("./Division/Division"));

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
      <header className="h-12 w-screen px-4 fixed bg-gray-900 pointer-events-auto z-50 flex">
        <nav className="flex w-full items-center justify-between">
          <div>
            {token ? (
              <>
                <Link to="/">
                  <span className="text-white font-semibold pr-4">
                    Tippspiel
                  </span>
                </Link>
                <Link to="/leaderboard">
                  <span className="text-white font-semibold pr-4">Tabelle</span>
                </Link>
                <Link to="/division">
                  <span className="text-white font-semibold pr-4">
                    Divisions
                  </span>
                </Link>
              </>
            ) : (
              ""
            )}
          </div>
          <div>
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
          </div>
        </nav>
      </header>
      <main className="pt-12 dark:text-gray-100 min-h-full">
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
              <Route
                path="/terms"
                element={<TermsAndConditions></TermsAndConditions>}
              ></Route>
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
      </main>
    </div>
  );
}

export default App;
