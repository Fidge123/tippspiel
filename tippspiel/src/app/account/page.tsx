import { Suspense } from "react";
import { auth } from "~/server/auth";
import { api } from "~/trpc/server";
import { EmailForm } from "./email";
import { Loading } from "./fallback";
import { NameForm } from "./name";
import { PasswordForm } from "./password";

export default async function Account() {
  const session = await auth();

  if (!session) {
    return null;
  }

  const user = await api.user.getCurrentUser();

  return (
    <main className="p-6">
      <div className="mb-4">
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
      </div>

      <div className="grid max-w-fit grid-flow-row grid-cols-3 gap-2">
        <span className="col-start-1 hidden">User ID:</span>
        <span className="col-span-2 hidden">{user.id}</span>

        <span className="col-start-1">E-Mail-Adresse:</span>
        <span>{user.email}</span>
        <Suspense fallback={<Loading />}>
          <EmailForm email={user.email} />
        </Suspense>

        <span className="col-start-1">Nutzername:</span>
        <span>{user.name}</span>
        <Suspense fallback={<Loading />}>
          <NameForm name={user.name} />
        </Suspense>

        <span className="col-start-1">Passwort:</span>
        <span>******</span>
        <Suspense fallback={<Loading />}>{<PasswordForm />}</Suspense>

        <span className="col-start-1">Verifiziert:</span>
        <p>{user.verified ? "Ja" : "Nein"}</p>

        {/*<span className="col-start-1">Settings</span>
        <pre className="rounded bg-gray-50 p-2">
          {JSON.stringify(user.settings, null, 2)}
        </pre>*/}
      </div>
    </main>
  );
}
