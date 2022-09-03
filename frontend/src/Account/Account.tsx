import { FormEvent, useState } from "react";
import { useRecoilState } from "recoil";
import { tokenState } from "../State/states";

function Account() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [token] = useRecoilState(tokenState);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
  }

  return (
    <article className="p-4 m-auto space-y-4 max-w-prose">
      <h1 className="pb-4 text-xl font-bold">Account Details</h1>
      <section className="space-y-8">
        <form onSubmit={handleSubmit}>
          <label htmlFor="username-input">
            <h1 className="font-bold">Benutzernamen ändern</h1>
          </label>
          <input
            id="username-input"
            className="px-2 mt-4 mr-4 text-black border"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <button type="submit">Ändern</button>
        </form>
        <form onSubmit={handleSubmit}>
          <label htmlFor="email-input">
            <h1 className="font-bold">E-Mail ändern</h1>
          </label>
          <input
            id="email-input"
            className="px-2 mt-4 mr-4 text-black border"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit">Ändern</button>
        </form>
        <form onSubmit={handleSubmit}>
          <h1 className="font-bold">Passwort ändern</h1>
          <div>
            <label htmlFor="old-password-input">Altes Passwort</label>
            <input
              id="old-password-input"
              type="password"
              minLength={8}
              maxLength={100}
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
              className="px-2 mt-4 ml-4 text-black border"
            />
          </div>
          <div>
            <label htmlFor="new-password-input">Neues Passwort</label>
            <input
              id="new-password-input"
              type="password"
              minLength={8}
              maxLength={100}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="px-2 mt-4 ml-4 text-black border"
            />
          </div>
          <button type="submit" className="mt-4">
            Ändern
          </button>
        </form>

        <p>Spoilermodus-Standard</p>
      </section>
      {error && <p>Ein Fehler ist aufgetreten: {error}</p>}
    </article>
  );
}

export default Account;
