import Link from "next/link";
import ForgotPasswordForm from "./_components/form";

export default async function ForgotPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <header className="mb-8 text-center">
          <h1 className="font-bold text-2xl text-gray-900">
            Passwort zurücksetzen
          </h1>
          <p className="mt-2 text-gray-600 text-sm">
            Gib deine E-Mail ein, um einen Link zum Zurücksetzen zu erhalten.
          </p>
        </header>

        <ForgotPasswordForm />

        <div className="mt-6 text-center text-sm">
          <Link
            href="/auth/login"
            className="font-medium text-blue-600 underline hover:text-blue-500"
          >
            Zurück zur Anmeldung
          </Link>
        </div>
      </div>
    </main>
  );
}
