import { useState, useEffect, FormEvent } from "react";
import "./Login.css";
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
    <div className="login">
      <h2>Login</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label id="email-label">E-Mail</label>
          <input
            type="email"
            onChange={(e) => setEmail(e.target.value)}
            required
            aria-labelledby="email-label"
            aria-required="true"
          />
        </div>
        <div>
          <label id="pw-label">Password</label>
          <input
            type="password"
            minLength={8}
            maxLength={100}
            onChange={(e) => setPassword(e.target.value)}
            required
            aria-labelledby="pw-label"
            aria-required="true"
          />
        </div>
        <button type="submit">Submit</button>
        {error && <p>An error occured: {error}</p>}
      </form>
    </div>
  );
}

export interface LoginProperties {
  setToken: Function;
}
