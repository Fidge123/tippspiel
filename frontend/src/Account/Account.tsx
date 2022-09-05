import { FormEvent, useState } from "react";
import { useRecoilState } from "recoil";
import { fetchFromAPI, getDecodedToken, refresh } from "../api";
import { hideByDefaultState, sendReminderState } from "../State/states";

function Account() {
  const name = getDecodedToken().name;
  const [localName, setLocalName] = useState(name);
  const [hideByDefault, setHideByDefault] = useRecoilState(hideByDefaultState);
  const [sendReminder, setSendReminder] = useRecoilState(sendReminderState);
  const [error, setError] = useState<string | undefined>();
  // const [email, setEmail] = useState("");
  // const [oldPassword, setOldPassword] = useState("");
  // const [newPassword, setNewPassword] = useState("");

  return (
    <article className="p-4 m-auto space-y-4 max-w-prose">
      <h1 className="pb-4 text-xl font-bold">Account Details</h1>
      <section className="space-y-8">
        {error && <p>🚨 Ein Fehler ist aufgetreten: {error}</p>}
        <form
          onSubmit={async (e: FormEvent) => {
            setError(undefined);
            e.preventDefault();
            try {
              await fetchFromAPI(
                "user/change/name",
                "POST",
                {
                  name: localName,
                },
                true
              );
              await refresh(true);
            } catch {
              setError("Name konnte nicht geändert werden");
              setLocalName(name);
            }
          }}
        >
          <label htmlFor="username-input">
            <h1 className="font-bold">Benutzernamen ändern</h1>
          </label>
          <input
            id="username-input"
            className="px-2 mt-4 mr-4"
            type="text"
            value={localName}
            onChange={(e) => setLocalName(e.target.value)}
            required
          />
          <button type="submit">Ändern</button>
        </form>
        {/* <form onSubmit={handleSubmit}>
          <label htmlFor="email-input">
            <h1 className="font-bold">E-Mail ändern</h1>
          </label>
          <input
            id="email-input"
            className="px-2 mt-4 mr-4"
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
              className="px-2 mt-4 ml-4"
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
              className="px-2 mt-4 ml-4"
            />
          </div>
          <button type="submit" className="mt-4">
            Ändern
          </button>
        </form> */}
        <h1 className="font-bold">Spoilermodus-Standard</h1>
        <input
          id="spoiler-input"
          className="mr-4"
          type="checkbox"
          checked={hideByDefault}
          onChange={(e) => setHideByDefault(e.target.checked)}
          required
        />
        <label htmlFor="spoiler-input">
          Spielergebnisse automatisch verstecken
        </label>
        <h1 className="font-bold">Erinnerungsmails</h1>
        <input
          id="email-reminder-input"
          className="mr-4"
          type="checkbox"
          checked={sendReminder}
          onChange={(e) => {
            setError(undefined);
            setSendReminder(e.target.checked);
          }}
          required
        />
        <label htmlFor="email-reminder-input">
          Erinnerungsmails aktivieren
        </label>
      </section>
    </article>
  );
}

export default Account;
