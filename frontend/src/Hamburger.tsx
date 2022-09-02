import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import { tokenState } from "./State/states";

function Hamburger() {
  const setToken = useSetRecoilState(tokenState);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <nav className="relative pointer-events-auto">
      <button onClick={() => setOpen(!open)}>
        <svg
          viewBox="0 0 100 80"
          width="16"
          height="16"
          role="img"
          aria-label="button to open secondary navigation"
        >
          <rect width="100" height="12"></rect>
          <rect y="33" width="100" height="12"></rect>
          <rect y="66" width="100" height="12"></rect>
        </svg>
      </button>
      <ul
        className={`fixed z-10 top-12 right-0 bg-slate-100 px-4 py-2 space-y-2 ${
          open ? "" : "hidden"
        }`}
      >
        <li>
          <Link
            onClick={() => {
              setOpen(false);
            }}
            to="/account"
          >
            Account
          </Link>
        </li>
        <li>
          <Link
            onClick={() => {
              setOpen(false);
            }}
            to="/leagues"
          >
            Ligen
          </Link>
        </li>
        <li>
          <Link
            onClick={() => {
              setOpen(false);
            }}
            to="/rules"
          >
            Regeln
          </Link>
        </li>
        <li>
          <Link
            onClick={() => {
              setOpen(false);
            }}
            to="/impressum"
          >
            Impressum
          </Link>
        </li>
        <li>
          <button
            onClick={() => {
              setToken("");
              navigate("/login", { replace: true });
            }}
          >
            Ausloggen
          </button>
        </li>
      </ul>
    </nav>
  );
}

export default Hamburger;
