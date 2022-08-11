import { useState, useEffect, FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import { BASE_URL } from "../api";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // const [consent, setConsent] = useState(false);
  const [consent] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [credentials, setCredentials] = useState<any>();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setCredentials({ email, password, name, consent });
  };

  useEffect(() => {
    (async () => {
      setError("");
      setSuccess("");
      if (credentials) {
        try {
          const res = await fetch(BASE_URL + "user/register", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(credentials),
          });
          if (res.ok) {
            setSuccess(
              "Erfolgreich registriert! Du solltest gleich eine E-Mail mit einem Bestätigungslink erhalten. Nach der Bestätigung kannst du dich einloggen."
            );
            setTimeout(() => navigate("/login", { replace: true }), 30000);
          } else {
            const error = await res.json();
            setPassword("");
            setCredentials(undefined);
            setError(error.message);
          }
        } catch (err: any) {
          setError(err);
        }
      }
    })();
  }, [credentials, navigate]);

  return (
    <div className="flex flex-col items-center">
      <h2>Register</h2>

      <form onSubmit={handleSubmit} className="flex flex-col items-center">
        <div className="flex flex-col items-center space-y-4 pb-4">
          <label id="name-label">Name</label>
          <input
            className="text-black px-2 border"
            disabled={credentials}
            type="text"
            onChange={(e) => setName(e.target.value)}
            required
            aria-labelledby="name-label"
            aria-required="true"
          />
        </div>
        <div className="flex flex-col items-center space-y-4 pb-4">
          <label id="email-label">E-Mail</label>
          <input
            className="text-black px-2 border"
            disabled={credentials}
            type="email"
            onChange={(e) => setEmail(e.target.value)}
            required
            aria-labelledby="email-label"
            aria-required="true"
          />
        </div>
        <div className="flex flex-col items-center space-y-4 pb-4">
          <label id="pw-label">Password</label>
          <input
            className="text-black px-2 border"
            disabled={credentials}
            type="password"
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            maxLength={100}
            required
            aria-labelledby="pw-label"
            aria-required="true"
          />
        </div>
        {/* <div>
          <label id="usage-label">
            <a
              href={
                window.location.origin + window.location.pathname + "#/terms"
              }
              target="_blank"
              rel="noreferrer"
            >
              Nutzungsbedingungen
            </a>
          </label>
          <span>
            <input
              className="text-black px-2 border"
              disabled={credentials}
              type="checkbox"
              onChange={(e) => setConsent(e.target.checked)}
              required
              aria-labelledby="email-label"
              aria-required="true"
            />
            <label id="">Ja, ich stimme zu!</label>
          </span>
        </div> */}
        <div className="flex flex-col items-center">
          <button className="m-4" disabled={credentials} type="submit">
            Registrieren
          </button>
        </div>
        {success && <p>{success}</p>}
        {error && <p>An error occured: {error}</p>}
      </form>
    </div>
  );
}

export default Register;