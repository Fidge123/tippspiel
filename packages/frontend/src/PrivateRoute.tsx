import { Navigate } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { tokenState } from "./State/states";

export function LoggedInRoute({ children }: any) {
  const token = useRecoilValue(tokenState);
  return token ? children : <Navigate replace to="/login" />;
}

export function LoggedOutRoute({ children }: any) {
  const token = useRecoilValue(tokenState);
  return token ? <Navigate replace to="/" /> : children;
}
