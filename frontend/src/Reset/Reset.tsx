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
      <h2>Password Reset</h2>
      <form onSubmit={reset} className="flex flex-col items-center m-4">
        <div className="space-y-4 space-x-2">
          <label id="pw-label">Neues Password</label>
          <input
            className="text-black px-2 border"
            type="password"
            minLength={8}
            maxLength={100}
            onChange={(e) => setPassword(e.target.value)}
            required
            aria-labelledby="pw-label"
            aria-required="true"
          />
        </div>
        <button type="submit" className="m-4">
          Submit
        </button>
        {error && <p>An error occured: {error}</p>}
        {success && <p>{success}</p>}
      </form>
    </div>
  );
}

export default Reset;
