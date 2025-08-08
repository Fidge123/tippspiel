import { Description, Field, Input, Label } from "@headlessui/react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SubmitButton } from "~/app/auth/_components/submit-button";
import { auth, signIn } from "~/server/auth";

export default async function LoginPage({ searchParams }: Props) {
  const session = await auth();

  if (session) {
    redirect("/");
  }

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <header className="mb-8 text-center">
          <h1 className="font-bold text-2xl text-gray-900">Anmelden</h1>
          <p className="mt-2 text-gray-600 text-sm">
            Mit deinem Konto anmelden und am Tippspiel teilnehmen.
          </p>
        </header>

        <form
          action={async (formData) => {
            "use server";
            await signIn("credentials", {
              email: formData.get("email") as string,
              password: formData.get("password") as string,
              redirect: false,
            });
            redirect((await searchParams).callbackUrl || "/");
          }}
          className="space-y-6 text-gray-900 text-sm"
        >
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
            <Label>Passwort</Label>
            <Input
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              maxLength={64}
              required
              className="w-full rounded border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Description className="text-gray-600">
              <Link
                href="/auth/forgot"
                className="font-medium text-blue-600 underline hover:text-blue-500"
              >
                Passwort vergessen?
              </Link>
            </Description>
          </Field>
          <SubmitButton>Anmelden</SubmitButton>
        </form>

        <footer className="mt-6 text-center">
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
  searchParams: { callbackUrl: string | undefined };
}
