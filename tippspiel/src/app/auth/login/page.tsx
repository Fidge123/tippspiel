import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import LoginForm from "./_components/form";

export default async function LoginPage({ searchParams }: Props) {
  const session = await auth();

  if (session) {
    redirect("/");
  }

  const params = await searchParams;
  const email = params.email ?? "";
  const message = params.message;

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <header className="mb-8 text-center">
          <h1 className="font-bold text-2xl text-gray-900">Anmelden</h1>
          <p className="mt-2 text-gray-600 text-sm">
            Mit deinem Konto anmelden und am Tippspiel teilnehmen.
          </p>
        </header>

        {message === "password-reset-success" && (
          <div className="mb-6 rounded bg-green-50 p-4 text-green-800 text-sm">
            Dein Passwort wurde erfolgreich zurückgesetzt. Du kannst dich jetzt
            mit deinem neuen Passwort anmelden.
          </div>
        )}

        <LoginForm callbackUrl={params.callbackUrl ?? "/"} email={email} />

        <footer className="mt-6 space-y-3 text-center">
          <p className="text-gray-600 text-sm">
            Noch kein Konto?{" "}
            <Link
              href="/auth/register"
              className="font-medium text-blue-600 underline hover:text-blue-500"
            >
              Registrieren
            </Link>
          </p>
        </footer>
      </div>
    </main>
  );
}

interface Props {
  searchParams: Promise<{
    callbackUrl: string | undefined;
    email: string | undefined;
    message: string | undefined;
  }>;
}
