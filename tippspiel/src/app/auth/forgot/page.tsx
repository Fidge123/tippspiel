import { Button, Field, Input, Label } from "@headlessui/react";

export default function ForgotPage() {
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

        <form className="space-y-6 text-gray-900 text-sm">
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

          <Button
            type="submit"
            className="w-full rounded bg-blue-600 px-4 py-2 text-white shadow-sm hover:bg-blue-700 focus:bg-blue-700"
          >
            Zurücksetzen
          </Button>
        </form>
      </div>
    </main>
  );
}
