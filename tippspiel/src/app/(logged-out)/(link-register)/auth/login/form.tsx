"use client";
import { Button, Description, Field, Input, Label } from "@headlessui/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { login } from "./action";

export default function LoginForm() {
  const params = useSearchParams();
  const email = params.get("email") ?? "";

  const [state, action, pending] = useActionState(login, {
    email: [email, false],
    password: ["", false],
    callbackUrl: params.get("callbackUrl") ?? "/",
    message: undefined,
    unverified: false,
  });

  return (
    <form action={action} className="space-y-6 text-gray-900 text-sm">
      <Field className="space-y-1">
        <Label>E-Mail-Adresse</Label>
        <Input
          name="email"
          type="email"
          autoComplete="email"
          maxLength={256}
          defaultValue={state.email[0]}
          invalid={state.email[1]}
          required
          className="w-full rounded border border-gray-300 px-3 py-2 shadow-sm focus:outline-2 focus:outline-blue-500 data-invalid:outline-2 data-invalid:outline-red-500"
        />
      </Field>

      <Field className="space-y-1">
        <Label>Passwort</Label>
        <Input
          name="password"
          type="password"
          autoComplete="current-password"
          minLength={8}
          maxLength={64}
          defaultValue={state.password[0]}
          invalid={state.password[1]}
          required
          className="w-full rounded border border-gray-300 px-3 py-2 shadow-sm focus:outline-2 focus:outline-blue-500 data-invalid:outline-2 data-invalid:outline-red-500"
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
      <p className="text-gray-600 empty:hidden">
        <Link
          href={`/auth/resend-verification${state.email[0] ? `?email=${encodeURIComponent(state.email[0])}` : ""}`}
          className="font-medium text-blue-600 underline hover:text-blue-500"
        >
          {state.unverified && "Neue Bestätigungsmail anfordern"}
        </Link>
      </p>
    </form>
  );
}
