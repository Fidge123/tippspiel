import Link from "next/link";
import { Suspense } from "react";
import LoginForm from "./form";
import Loading from "./form-loading";

export default async function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <header className="mb-8 text-center">
          <h1 className="font-bold text-2xl text-gray-900">Anmelden</h1>
          <p className="mt-2 text-gray-600 text-sm">
            Mit deinem Konto anmelden und am Tippspiel teilnehmen.
          </p>
        </header>

        <Suspense fallback={<Loading />}>
          <LoginForm />
        </Suspense>

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
