import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Verify.css";
import { BASE_URL } from "../api";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function Verify() {
  const query = useQuery();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    (async () => {
      const id = query.get("id");
      const token = query.get("token");

      if (id && token && !done) {
        try {
          const res = await fetch(BASE_URL + "user/verify", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              id,
              token,
            }),
          });

          setDone(true);

          if (res.ok) {
            setSuccess(
              "Account erfolgreich bestätigt! Du wirst in 5 Sekunden zum einloggen weitergeleitet."
            );
            setTimeout(() => navigate("/login", { replace: true }), 5000);
          } else {
            const e = await res.json();
            setError(e.message);
          }
        } catch (err: any) {
          setError(err);
        }
      } else {
        console.log(token, id);
        setError("Link invalid!");
      }
    })();
  }, [query, navigate, done]);

  return (
    <div className="verify">
      {error && <p>Ein Fehler ist aufgetreten: {error}</p>}
      {success && <p>{success}</p>}
    </div>
  );
}

export default Verify;
