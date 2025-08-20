import { env } from "~/env";

export default function TermsPage() {
  return (
    <main className="m-auto flex max-w-prose flex-col space-y-2">
      <h1 className="font-bold text-xl">Impressum</h1>

      <p>Seitenbetreiber:</p>
      <ul>
        <li>Florian Richter</li>
        <li>George-Stephenson-Straße 7</li>
        <li>10557 Berlin</li>
        <li className="pt-2">E-Mail: {env.SMTP2GO_SENDER_EMAIL}</li>
      </ul>

      <p>Diese Seite wird privat betrieben und nicht gewerblich genutzt.</p>
    </main>
  );
}
