"use client";

import { Button, Description, Field, Input, Label } from "@headlessui/react";
import Link from "next/link";
import { useActionState } from "react";
import { registerUser } from "../action";

export default function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerUser, {
    email: ["", false],
    name: ["", false],
    password: ["", false],
    confirmPassword: ["", false],
    consent: ["", false],
  });

  return (
    <form action={formAction} className="space-y-6 text-gray-900 text-sm">
      <Field className="space-y-1">
        <Label>E-Mail-Adresse</Label>
        <Input
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={state.email[0]}
          invalid={state.email[1]}
          required
          className="w-full rounded border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 data-invalid:outline-none data-invalid:ring-2 data-invalid:ring-red-500"
        />
      </Field>

      <Field className="space-y-1">
        <Label>Nutzername</Label>
        <Input
          name="name"
          type="text"
          autoComplete="username"
          defaultValue={state.name[0]}
          invalid={state.name[1]}
          maxLength={42}
          required
          className="w-full rounded border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 data-invalid:outline-none data-invalid:ring-2 data-invalid:ring-red-500"
        />
        <Description className="text-gray-600">
          Der Nutzername wird anderen Spielern angezeigt.
        </Description>
      </Field>

      <Field className="space-y-1">
        <Label>Passwort</Label>
        <Input
          name="password"
          type="password"
          autoComplete="new-password"
          defaultValue={state.password[0]}
          invalid={state.password[1]}
          minLength={8}
          maxLength={64}
          required
          className="w-full rounded border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 data-invalid:outline-none data-invalid:ring-2 data-invalid:ring-red-500"
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
          defaultValue={state.confirmPassword[0]}
          invalid={state.confirmPassword[1]}
          minLength={8}
          required
          className="w-full rounded border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 data-invalid:outline-none data-invalid:ring-2 data-invalid:ring-red-500"
        />
      </Field>

      <Field className="flex">
        <Input
          name="consent"
          type="checkbox"
          value="agreed"
          required
          defaultChecked={state.consent[0] === "agreed"}
          invalid={state.consent[1]}
          className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 data-invalid:ring-2 data-invalid:ring-red-500"
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
        disabled={pending}
        className="w-full rounded bg-blue-600 px-4 py-2 text-white shadow-sm hover:bg-blue-700 focus:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Konto erstellen
      </Button>
      <p className="text-red-500 empty:hidden">{state.message}</p>
    </form>
  );
}
