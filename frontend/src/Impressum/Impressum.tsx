import Terms from "./Terms";
import Legal from "./Legal";

function Impressum() {
  return (
    <div className="p-4 m-auto max-w-prose">
      <article>
        <h1 className="text-xl font-bold">Impressum</h1>
        <p className="py-1">Seitenbetreiber:</p>
        <p className="py-1">
          Florian Richter
          <br />
          Konrad-Zuse-Ring 10
          <br />
          14469 Potsdam
        </p>
        <p className="py-1">E-Mail: admin@6v4.de</p>
        <p className="py-1">
          Diese Seite ist wird privat betrieben und nicht gewerblich genutzt.
        </p>
      </article>
      <Terms />
      <Legal />
    </div>
  );
}

export default Impressum;
