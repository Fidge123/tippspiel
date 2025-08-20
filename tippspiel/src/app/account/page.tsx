import { Suspense } from "react";
import { api } from "~/trpc/server";
import { EmailForm } from "./email";
import { Loading } from "./fallback";
import { NameForm } from "./name";
import { PasswordForm } from "./password";
import { Settings } from "./settings";
import { SettingsLoading } from "./settings-loading";
import SyncButton from "./sync";

export default async function Account() {
  const user = await api.user.getCurrentUser();
  const settings = [
    {
      label: "Spoilermodus",
      prop: "hideScore",
      description:
        "Wenn der Spoilermodus aktiviert ist, werden die Ergebnisse erst angezeigt wenn du den Spoilermodus für die Woche deaktivierst.",
      enabled: user.settings.hideScore ?? false,
    },
    {
      label: "Erinnerung per E-Mail",
      prop: "reminders",
      description:
        "Erinnerungs-E-Mails werden am Donnerstag und Sonntag um 18 Uhr verschickt.",
      enabled: user.settings?.reminders ?? false,
    },
  ];

  return (
    <main className="p-6">
      <header>
        <h1 className="font-bold text-2xl">Account Details</h1>
        <p className="text-gray-500 text-sm">
          {`Mitglied seit ${new Date(user.createdAt).toLocaleDateString(
            "de-DE",
            {
              year: "numeric",
              month: "long",
              day: "numeric",
            },
          )}`}
        </p>
      </header>

      <p className="py-4">
        Du kannst deine Daten über das Stift-Symbol bearbeiten.
      </p>

      <section>
        <h2 className="sr-only">Nutzerdaten</h2>

        <table>
          <thead className="sr-only">
            <tr>
              <th scope="col">Eigenschaft</th>
              <th scope="col">Wert</th>
              <th scope="col">Bearbeiten</th>
            </tr>
          </thead>
          <tbody className="grid grid-cols-[1fr_1fr_16px] gap-x-8 gap-y-2">
            <tr className="contents">
              <th scope="row" className="text-left font-semibold">
                E-Mail-Adresse:
              </th>
              <td>{user.email}</td>
              <td>
                <Suspense fallback={<Loading />}>
                  <EmailForm email={user.email} />
                </Suspense>
              </td>
            </tr>

            <tr className="contents">
              <th scope="row" className="text-left font-semibold">
                Nutzername:
              </th>
              <td>{user.name}</td>
              <td>
                <Suspense fallback={<Loading />}>
                  <NameForm name={user.name} />
                </Suspense>
              </td>
            </tr>

            <tr className="contents">
              <th scope="row" className="text-left font-semibold">
                Passwort:
              </th>
              <td aria-label="Passwort verborgen">******</td>
              <td>
                <Suspense fallback={<Loading />}>
                  <PasswordForm />
                </Suspense>
              </td>
            </tr>

            <tr className="contents">
              <th scope="row" className="text-left font-semibold">
                Verifiziert:
              </th>
              <td>{user.verified ? "Ja" : "Nein"}</td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="mt-6 max-w-96">
        <h2 className="sr-only">Einstellungen</h2>

        {settings.map(({ label, prop, description, enabled }) => (
          <Suspense
            key={label}
            fallback={
              <SettingsLoading
                label={label}
                description={description}
                enabled={enabled}
              />
            }
          >
            <Settings
              label={label}
              prop={prop}
              description={description}
              enabled={enabled}
            />
          </Suspense>
        ))}

        {user.email.includes("@example.com") && (
          <div className="mt-6">
            <Suspense>
              <SyncButton />
            </Suspense>
          </div>
        )}
      </section>
    </main>
  );
}
