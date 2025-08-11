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

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <header className="mb-8 text-center">
          <h1 className="font-bold text-2xl text-gray-900">Anmelden</h1>
          <p className="mt-2 text-gray-600 text-sm">
            Mit deinem Konto anmelden und am Tippspiel teilnehmen.
          </p>
        </header>

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
          <p className="text-gray-600 text-sm">
            E-Mail nicht erhalten?{" "}
            <Link
              href={`/auth/resend-verification${email ? `?email=${encodeURIComponent(email)}` : ""}`}
              className="font-medium text-blue-600 underline hover:text-blue-500"
            >
              Bestätigung erneut senden
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
  }>;
}
