import { useState, useEffect, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useSetRecoilState } from "recoil";

import { BASE_URL } from "../api";
import { tokenState } from "../State/states";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [credentials, setCredentials] = useState<{
    email: string;
    password: string;
  }>();
  const navigate = useNavigate();
  const setToken = useSetRecoilState(tokenState);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setCredentials({ email, password });
  };

  async function forgot() {
    try {
      if (!email) {
        setError("Need to set email");
        return;
      }
      const res = await fetch(BASE_URL + "user/request-reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        navigate("/", { replace: true });
      } else {
        const error = await res.json();
        setError(error.message);
      }
    } catch (err: any) {
      setError(err);
    }
  }

  useEffect(() => {
    (async () => {
      if (credentials) {
        try {
          const res = await fetch(BASE_URL + "user/login", {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(credentials),
          });
          if (res.ok) {
            const token = await res.json();
            setToken(token);
          } else {
            const error = await res.json();
            setPassword("");
            setError(error.message);
          }
        } catch (err: any) {
          setError(err);
        }
      }
    })();
  }, [credentials, setToken]);

  return (
    <div className="flex flex-col items-center">
      <h1 className="my-4 font-bold">Mit bestehendem Konto einloggen:</h1>
      <form onSubmit={handleSubmit} className="flex flex-col items-center">
        <div className="flex flex-col items-center pb-4 space-y-4">
          <label htmlFor="email-input">E-Mail</label>
          <input
            id="email-input"
            className="px-2"
            type="email"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col items-center space-y-4">
          <label htmlFor="password-input">Passwort</label>
          <input
            id="password-input"
            className="px-2"
            type="password"
            minLength={8}
            maxLength={100}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="mt-8">
          Einloggen
        </button>

        <div className="flex flex-col items-center">
          <button
            className="mt-4 italic bg-transparent border-0"
            onClick={() => forgot()}
          >
            Passwort vergessen?
          </button>
        </div>
        {error && <p>Ein Fehler ist aufgetreten: {error}</p>}
      </form>
    </div>
  );
}
