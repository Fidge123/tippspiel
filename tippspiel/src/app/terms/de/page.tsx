import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="m-auto flex max-w-4xl flex-col py-16">
      <Link
        href="/terms/en"
        className="pb-8 font-medium text-blue-600 underline hover:text-blue-500"
      >
        For the English version, please click here.
      </Link>
      <div className="prose prose-gray max-w-none">
        <h1 className="font-bold text-2xl">
          Nutzungs- und Datenschutzbestimmungen
        </h1>

        <h2 className="mt-6 font-bold text-xl">1. Datenschutzerklärung</h2>

        <h3 className="mt-4 font-semibold text-lg">Verantwortlicher</h3>
        <p>
          Florian Richter
          <br />
          George-Stephenson-Straße 7<br />
          10557 Berlin
          <br />
          E-Mail: admin@nfl-tippspiel.de
        </p>

        <h3 className="mt-4 font-semibold text-lg">
          Erhebung und Verarbeitung personenbezogener Daten
        </h3>
        <p>
          Diese Website erhebt und verarbeitet personenbezogene Daten zu
          folgenden Zwecken:
        </p>
        <ul className="list-disc pl-6">
          <li>
            <strong>Nutzerregistrierung und -verwaltung:</strong> Benutzername
            und E-Mail-Adresse zur Kontoeröffnung und -verwaltung
          </li>
          <li>
            <strong>Technische Protokollierung:</strong> IP-Adressen werden in
            Server-Logs zur Sicherheit und Fehlerbehebung gespeichert
          </li>
          <li>
            <strong>Funktionalität:</strong> Login-Tokens werden in Cookies
            gespeichert, um Sie angemeldet zu halten
          </li>
          <li>
            <strong>Anonyme Nutzungsstatistiken:</strong> Nutzungsdaten ohne
            Speicherung personenbezogener Daten
          </li>
        </ul>

        <h3 className="mt-4 font-semibold text-lg">
          Rechtsgrundlage der Verarbeitung
        </h3>
        <p>
          Die Verarbeitung erfolgt auf Grundlage folgender Rechtsgrundlagen:
        </p>
        <ul className="list-disc pl-6">
          <li>
            <strong>Art. 6 Abs. 1 lit. b DSGVO:</strong> Vertragserfüllung
            (Bereitstellung der Tippspiel-Funktionen)
          </li>
          <li>
            <strong>Art. 6 Abs. 1 lit. f DSGVO:</strong> Berechtigte Interessen
            (Sicherheit, Funktionalität, anonyme Statistiken)
          </li>
        </ul>

        <h3 className="mt-4 font-semibold text-lg">
          Datenweitergabe und Drittländer
        </h3>
        <p>
          Ihre Daten werden grundsätzlich nicht an Dritte weitergegeben.
          Folgende technische Dienstleister werden genutzt:
        </p>
        <ul className="list-disc pl-6">
          <li>
            <strong>Backup-Speicherung:</strong> CloudFlare, Inc.
          </li>
          <li>
            <strong>Hosting:</strong> Hetzner Online GmbH
          </li>
        </ul>

        <h3 className="mt-4 font-semibold text-lg">Speicherdauer</h3>
        <p>Personenbezogene Daten werden gespeichert:</p>
        <ul className="list-disc pl-6">
          <li>Bis zur Löschung des Nutzerkontos durch den Nutzer, oder</li>
          <li>Automatisch nach 3 Jahren Inaktivität des Kontos</li>
          <li>Server-Logs werden regelmäßig rotiert und gelöscht</li>
        </ul>

        <h3 className="mt-4 font-semibold text-lg">Ihre Rechte</h3>
        <p>
          Sie haben folgende Rechte bezüglich Ihrer personenbezogenen Daten:
        </p>
        <ul className="list-disc pl-6">
          <li>
            <strong>Auskunft</strong> (Art. 15 DSGVO): Welche Daten über Sie
            gespeichert sind
          </li>
          <li>
            <strong>Berichtigung</strong> (Art. 16 DSGVO): Korrektur unrichtiger
            Daten
          </li>
          <li>
            <strong>Löschung</strong> (Art. 17 DSGVO): Löschung Ihrer Daten
            unter bestimmten Voraussetzungen
          </li>
          <li>
            <strong>Datenübertragbarkeit</strong> (Art. 20 DSGVO): Herausgabe
            Ihrer Daten in strukturiertem Format
          </li>
          <li>
            <strong>Widerspruch</strong> (Art. 21 DSGVO): Widerspruch gegen die
            Verarbeitung aus berechtigten Interessen
          </li>
          <li>
            <strong>Beschwerde</strong> (Art. 77 DSGVO): Bei der zuständigen
            Datenschutzaufsichtsbehörde
          </li>
        </ul>
        <p>
          Zur Ausübung Ihrer Rechte wenden Sie sich an: admin@nfl-tippspiel.de
        </p>

        <h3 className="mt-4 font-semibold text-lg">Cookies</h3>
        <p>
          Diese Website verwendet Cookies ausschließlich zum Speichern von
          Login-Tokens. Diese Verwendung fällt unter die berechtigten Interessen
          der Websitebetreiber und bedarf keiner expliziten Einwilligung laut
          TTDSG. Durch die weitere Nutzung der Webseite stimmen Sie der
          Verwendung dieser technisch notwendigen Cookies zu.
        </p>

        <h2 className="mt-6 font-bold text-xl">2. Nutzungsbedingungen</h2>

        <h3 className="mt-4 font-semibold text-lg">Zweck der Website</h3>
        <p>
          Diese Website stellt eine private, nicht-kommerzielle Plattform für
          American Football Tippspiele zur Verfügung.
        </p>

        <h3 className="mt-4 font-semibold text-lg">Nutzerkonto</h3>
        <p>
          Durch die Registrierung erstellen Sie ein Benutzerkonto. Sie sind
          verpflichtet:
        </p>
        <ul className="list-disc pl-6">
          <li>Wahrheitsgemäße Angaben zu machen</li>
          <li>Ihre Zugangsdaten geheim zu halten</li>
          <li>Uns unverzüglich über unbefugten Zugriff zu informieren</li>
        </ul>

        <h3 className="mt-4 font-semibold text-lg">
          Markenrechte und Urheberrecht
        </h3>
        <p>
          NFL und das NFL-Logo sind eingetragene Marken der National Football
          League. Die Teamnamen, Logos und Uniformdesigns sind eingetragene
          Marken der jeweiligen Teams. Alle anderen NFL-bezogenen Marken sind
          Marken der National Football League.
        </p>
        <p>
          Diese Website enthält Material der National Football League, das
          urheberrechtlich geschützt ist. Dieses Material wird nur nominativ
          verwendet. Diese Website wird weder gesponsert noch von der National
          Football League unterstützt. Diese Website besitzt keine Namen oder
          Logos, die eingetragene Marken der National Football League sind, noch
          erhebt sie Anspruch darauf.
        </p>

        <h3 className="mt-4 font-semibold text-lg">Haftungsausschluss</h3>
        <p>
          Diese Website wird privat und nicht gewerblich betrieben. Eine Haftung
          für Verfügbarkeit, Funktionalität oder Datenverlust wird
          ausgeschlossen, soweit gesetzlich zulässig.
        </p>

        <h3 className="mt-4 font-semibold text-lg">Kontakt</h3>
        <p>
          Bei Fragen zu diesen Bestimmungen oder urheberrechtlichen Anliegen
          wenden Sie sich an: admin@nfl-tippspiel.de
        </p>
      </div>
    </main>
  );
}
