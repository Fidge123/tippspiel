import { Suspense } from "react";
import { api } from "~/trpc/server";
import { EmailForm } from "./email";
import { Loading } from "./fallback";
import { NameForm } from "./name";
import { PasswordForm } from "./password";
import { Settings } from "./settings";
import { SettingsLoading } from "./settings-loading";

export default async function Account() {
  const user = await api.user.getCurrentUser();
  const settings = [
    {
      label: "Spoilermodus",
      prop: "hideScore",
      description:
        "Wenn der Spoilermodus aktiviert ist, werden die Spielergebnisse erst angezeigt wenn du den Spoilermodus für die Woche deaktivierst.",
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

      <div className="max-w-96">
        <div className="grid max-w-full grid-cols-[1fr_1fr_16px] gap-2">
          <span className="col-start-1 hidden">User ID:</span>
          <span className="col-span-2 hidden">{user.id}</span>

          <span className="col-start-1 font-semibold">E-Mail-Adresse:</span>
          <span>{user.email}</span>
          <Suspense fallback={<Loading />}>
            <EmailForm email={user.email} />
          </Suspense>

          <span className="col-start-1 font-semibold">Nutzername:</span>
          <span>{user.name}</span>
          <Suspense fallback={<Loading />}>
            <NameForm name={user.name} />
          </Suspense>

          <span className="col-start-1 font-semibold">Passwort:</span>
          <span>******</span>
          <Suspense fallback={<Loading />}>{<PasswordForm />}</Suspense>

          <span className="col-start-1 font-semibold">Verifiziert:</span>
          <p>{user.verified ? "Ja" : "Nein"}</p>
        </div>

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
      </div>
    </main>
  );
}
