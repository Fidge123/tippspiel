import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BASE_URL } from "../api";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function Reset() {
  const query = useQuery();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [done, setDone] = useState(false);

  async function reset() {
    const id = query.get("id");
    const token = query.get("token");

    if (id && token && !done) {
      try {
        const res = await fetch(BASE_URL + "user/reset", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id,
            password,
            token,
          }),
        });

        setDone(true);

        if (res.ok) {
          setSuccess(
            "Passwort erfolgreich zurückgesetzt! Du wirst in 5 Sekunden zum einloggen weitergeleitet."
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
  }

  return (
    <div className="flex flex-col items-center">
      <h1 className="my-4 font-bold">Passwort zurücksetzen</h1>
      <form onSubmit={reset} className="flex flex-col items-center">
        <div className="space-x-2 space-y-4">
          <label htmlFor="pw-input">Neues Passwort</label>
          <input
            id="pw-input"
            className="px-2"
            type="password"
            minLength={8}
            maxLength={100}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="m-8">
          Zurücksetzen
        </button>
        {error && <p>Ein Fehler ist aufgetreten: {error}</p>}
        {success && <p>{success}</p>}
      </form>
    </div>
  );
}

export default Reset;
