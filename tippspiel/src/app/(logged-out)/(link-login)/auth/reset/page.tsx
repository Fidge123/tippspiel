import Link from "next/link";
import ResetPasswordForm from "./form";

export default async function ResetPasswordPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <header className="mb-8 text-center">
          <h1 className="font-bold text-2xl text-gray-900">
            Neues Passwort setzen
          </h1>
          <p className="mt-2 text-gray-600 text-sm">
            Gib dein neues Passwort ein.
          </p>
        </header>

        <ResetPasswordForm />

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
