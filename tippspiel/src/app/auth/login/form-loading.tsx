import { Button, Description, Field, Input, Label } from "@headlessui/react";
import Link from "next/link";

export default function Loading() {
  return (
    <form className="mb-12 animate-pulse space-y-6 text-gray-900 text-sm">
      <Field className="space-y-1">
        <Label>E-Mail-Adresse</Label>
        <Input
          name="email"
          type="email"
          disabled
          className="w-full rounded border border-gray-300 px-3 py-2 shadow-sm"
        />
      </Field>

      <Field className="space-y-1">
        <Label>Passwort</Label>
        <Input
          name="password"
          type="password"
          disabled
          className="w-full rounded border border-gray-300 px-3 py-2 shadow-sm"
        />
        <Description className="text-gray-600">
          <Link
            href="/auth/forgot"
            className="font-medium text-blue-600 underline"
          >
            Passwort vergessen?
          </Link>
        </Description>
      </Field>
      <Button
        type="submit"
        disabled
        className="w-full rounded bg-blue-600 px-4 py-2 text-white shadow-sm"
      >
        Anmelden
      </Button>
    </form>
  );
}
