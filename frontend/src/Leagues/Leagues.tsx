import { FormEvent, useState } from "react";
import { useRecoilValue } from "recoil";
import { fetchFromAPI } from "../api";
import { tokenState } from "../State/states";

function Leagues() {
  const [leagueName, setLeagueName] = useState("");
  const token = useRecoilValue(tokenState);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    return await fetchFromAPI("leagues/create", token, "POST", {
      name: leagueName,
    });
  }

  return (
    <article className="max-w-prose m-auto p-4 space-y-4">
      <h1 className="text-xl font-bold">Liga-Verwaltung</h1>
      <section>
        <h1 className="text-l font-bold">Aktive Ligen</h1>
        {[].map((league) => (
          <div>
            <p>Name</p>
            <p>Teilnehmer</p>
            <p>Rolle</p>
            <p>Aktionen (umbenennen, einladen, löschen)</p>
          </div>
        ))}
      </section>
      <section>
        <h1 className="text-l font-bold">Abgeschlossene Ligen</h1>
        {[].map((league) => (
          <div>
            <p>Name</p>
            <p>Teilnehmer</p>
            <p>Platzierung</p>
          </div>
        ))}
      </section>
      <form onSubmit={handleSubmit}>
        <p>Neue Liga erstellen</p>
        <label htmlFor="email-input">
          <h1 className="font-bold">Name der Liga</h1>
        </label>
        <input
          id="email-input"
          className="text-black px-2 mt-4 mr-4 border"
          value={leagueName}
          onChange={(e) => setLeagueName(e.target.value)}
          required
        />
        <button type="submit">Erstellen</button>
      </form>
    </article>
  );
}

export default Leagues;
