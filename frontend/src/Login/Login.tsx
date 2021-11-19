import { useState, useEffect, FormEvent } from "react";
import { BASE_URL } from "../api";
import { useHistory } from "react-router-dom";

export default function Login({ setToken }: LoginProperties) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [credentials, setCredentials] = useState<any>();
  const history = useHistory();

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
        history.push("/");
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
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(credentials),
          });
          if (res.ok) {
            const token = await res.json();
            setToken(token.access_token);
            history.push("/");
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
  }, [credentials, setToken, history]);

  return (
    <div className="flex flex-col items-center">
      <h2>Login</h2>

      <form onSubmit={handleSubmit} className="flex flex-col items-center">
        <div className="flex flex-col items-center space-y-4 pb-4">
          <label id="email-label">E-Mail</label>
          <input
            className="text-black px-2"
            type="email"
            onChange={(e) => setEmail(e.target.value)}
            required
            aria-labelledby="email-label"
            aria-required="true"
          />
        </div>
        <div className="flex flex-col items-center space-y-4">
          <label id="pw-label">Password</label>
          <input
            className="text-black px-2"
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

        <div className="flex flex-col items-center">
          <button
            className="m-4 italic border-0 bg-transparent"
            onClick={() => forgot()}
          >
            Forgot Password?
          </button>
        </div>
        {error && <p>An error occured: {error}</p>}
      </form>
    </div>
  );
}

export interface LoginProperties {
  setToken: Function;
}
