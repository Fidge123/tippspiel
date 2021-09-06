import { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import "./Verify.css";
import { BASE_URL } from "../api";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function Verify() {
  const query = useQuery();
  const history = useHistory();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    (async () => {
      const id = query.get("id");
      const token = query.get("token");
      setError("");
      setSuccess("");

      if (id && token) {
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
          if (res.ok) {
            setSuccess(
              "Account erfolgreich bestätigt! Du wirst in 5 Sekunden zum einloggen weitergeleitet."
            );
            setTimeout(() => history.push("/login"), 5000);
          } else {
            const error = await res.json();
            setError(error.message);
          }
        } catch (err: any) {
          setError(err);
        }
      } else {
        console.log(token, id);
        setError("Link invalid!");
      }
    })();
  }, [query, history]);

  return (
    <div className="verify">
      {error && <p>Error occured: {error}</p>}
      {success && <p>{success}</p>}
    </div>
  );
}

export default Verify;
