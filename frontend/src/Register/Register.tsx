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
      <h1 className="my-4 font-bold">Ein neues Konto registrieren:</h1>
      <form onSubmit={handleSubmit} className="flex flex-col items-center">
        <div className="flex flex-col items-center pb-4 space-y-4">
          <label htmlFor="name-input">Name</label>
          <input
            id="name-input"
            className="px-2 text-black border"
            disabled={credentials}
            type="text"
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col items-center pb-4 space-y-4">
          <label htmlFor="email-input">E-Mail</label>
          <input
            id="email-input"
            className="px-2 text-black border"
            disabled={credentials}
            type="email"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col items-center pb-4 space-y-4">
          <label htmlFor="pw-input">Passwort</label>
          <input
            id="pw-input"
            className="px-2 text-black border"
            disabled={credentials}
            type="password"
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            maxLength={100}
            required
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
              className="px-2 text-black border"
              disabled={credentials}
              type="checkbox"
              onChange={(e) => setConsent(e.target.checked)}
              required
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
        {error && <p>Ein Fehler ist aufgetreten: {error}</p>}
      </form>
    </div>
  );
}

export default Register;
