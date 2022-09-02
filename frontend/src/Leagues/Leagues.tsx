function Leagues() {
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
      <p>Neue Liga erstellen</p>
    </article>
  );
}

export default Leagues;
