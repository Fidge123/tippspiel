import { Button, Description, Field, Input, Label } from "@headlessui/react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { api } from "~/trpc/server";

async function registerUser(formData: FormData) {
  "use server";

  const email = formData.get("email") as string;
  const name = formData.get("name") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  const consent = formData.get("consent") as string;

  try {
    if (!consent) {
      throw new Error("All fields are required");
    }

    if (password !== confirmPassword) {
      throw new Error("Passwords do not match");
    }

    await api.user.register({
      email,
      name: name.trim(),
      password,
      consent: new Date(),
    });
  } catch (error: unknown) {
    // TODO Handle errors correctly. This is almost invisible to the user.
    redirect(
      `/register?error=${encodeURIComponent(
        (error as Error).message || "An error occurred",
      )}`,
    );
  }

  redirect("/sign-in");
}

export default function RegisterPage() {
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

        <form action={registerUser} className="space-y-6 text-gray-900 text-sm">
          <Field className="space-y-1">
            <Label>E-Mail-Adresse</Label>
            <Input
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full rounded border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </Field>

          <Field className="space-y-1">
            <Label>Nutzername</Label>
            <Input
              name="name"
              type="text"
              autoComplete="username"
              required
              className="w-full rounded border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Description className="text-gray-600">
              Der Nutzername wird anderen Spielern angezeigt.
            </Description>
          </Field>

          <Field className="space-y-1">
            <Label>Passwort</Label>
            <input
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
              className="w-full rounded border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Description className="text-gray-600">
              Mindestlänge 8 Zeichen
            </Description>
          </Field>

          <Field>
            <Label>Passwort bestätigen</Label>
            <Input
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
              className="w-full rounded border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </Field>

          <Field className="flex">
            <Input
              name="consent"
              type="checkbox"
              value="agreed"
              required
              className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600"
            />
            <Label htmlFor="consent" className="ml-2 text-gray-700 text-sm">
              Ich stimme den{" "}
              <Link
                href="/terms"
                className="text-blue-600 underline hover:text-blue-500"
                target="_blank"
                rel="noopener noreferrer"
              >
                Nutzungs- und Datenschutzbestimmungen
              </Link>{" "}
              zu
            </Label>
          </Field>

          <Button
            type="submit"
            className="w-full rounded bg-blue-600 px-4 py-2 text-white shadow-sm hover:bg-blue-700 focus:bg-blue-700"
          >
            Konto erstellen
          </Button>
        </form>

        <footer className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            Du hast bereits ein Konto?{" "}
            <Link
              href="/sign-in"
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
