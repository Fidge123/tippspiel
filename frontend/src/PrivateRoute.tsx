import { Navigate } from "react-router-dom";
import { isLoggedIn } from "./api";

export function LoggedInRoute({ children }: any) {
  const token = isLoggedIn();
  return token ? children : <Navigate replace to="/login" />;
}

export function LoggedOutRoute({ children }: any) {
  const token = isLoggedIn();
  return token ? <Navigate replace to="/" /> : children;
}
