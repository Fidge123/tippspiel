import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import RegisterForm from "./_components/form";

export default async function RegisterPage() {
  const session = await auth();

  if (session) {
    redirect("/");
  }
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <header className="mb-8 text-center">
          <h1 className="font-bold text-2xl text-gray-900">
            Erstelle ein Konto
          </h1>
          <p className="mt-2 text-gray-600 text-sm">
            Registriere dich, um am Tippspiel teilnehmen zu können.
          </p>
        </header>

        <RegisterForm />

        <footer className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            Du hast bereits ein Konto?{" "}
            <Link
              href="/auth/login"
              className="font-medium text-blue-600 underline hover:text-blue-500"
            >
              Anmelden
            </Link>
          </p>
        </footer>
      </div>
    </main>
  );
}
