"use client";
import { Button, Description, Field, Input, Label } from "@headlessui/react";
import Link from "next/link";
import { useActionState } from "react";
import { login } from "../action";

export default function LoginForm({ callbackUrl }: Props) {
  const [state, action, pending] = useActionState(login, {
    email: ["", false],
    password: ["", false],
    callbackUrl: callbackUrl,
    message: undefined,
  });

  return (
    <form action={action} className="space-y-6 text-gray-900 text-sm">
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
        <Label>Passwort</Label>
        <Input
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          maxLength={64}
          defaultValue={state.password[0]}
          invalid={state.password[1]}
          required
          className="w-full rounded border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 data-invalid:outline-none data-invalid:ring-2 data-invalid:ring-red-500"
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
      <Button
        type="submit"
        disabled={pending}
        className="w-full rounded bg-blue-600 px-4 py-2 text-white shadow-sm hover:bg-blue-700 focus:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Anmelden
      </Button>
      <p className="text-red-500 empty:hidden">{state.message}</p>
    </form>
  );
}

interface Props {
  callbackUrl: string;
}
