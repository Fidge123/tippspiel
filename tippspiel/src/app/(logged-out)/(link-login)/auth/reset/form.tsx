"use client";
import { Button, Field, Input, Label } from "@headlessui/react";
import { useSearchParams } from "next/navigation";
import { Suspense, useActionState } from "react";
import Spinner from "~/components/ui/spinner";
import { resetPassword } from "./action";

function Form() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [state, action, pending] = useActionState(resetPassword, {
    password: ["", false],
    confirmPassword: ["", false],
    token: token,
    message: undefined,
    success: false,
  });

  return (
    <form action={action} className="space-y-6 text-gray-900 text-sm">
      <Field className="hidden">
        <Label>Token</Label>
        <Input name="token" type="hidden" defaultValue={token} required />
      </Field>

      <Field className="space-y-1">
        <Label>Neues Passwort</Label>
        <Input
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          maxLength={64}
          defaultValue={state.password[0]}
          invalid={state.password[1]}
          required
          disabled={!token || state.success}
          className="w-full rounded border border-gray-300 px-3 py-2 shadow-sm focus:outline-2 focus:outline-blue-500 data-invalid:outline-2 data-invalid:outline-red-500"
        />
      </Field>

      <Field className="space-y-1">
        <Label>Passwort bestätigen</Label>
        <Input
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          minLength={8}
          maxLength={64}
          defaultValue={state.confirmPassword[0]}
          invalid={state.confirmPassword[1]}
          required
          disabled={!token || state.success}
          className="w-full rounded border border-gray-300 px-3 py-2 shadow-sm focus:outline-2 focus:outline-blue-500 data-invalid:outline-2 data-invalid:outline-red-500"
        />
      </Field>

      <Button
        type="submit"
        disabled={!token || pending || state.success}
        className="w-full rounded bg-blue-600 px-4 py-2 text-white shadow-sm hover:bg-blue-700 focus:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "Wird gesetzt..." : "Passwort setzen"}
      </Button>

      {state.success ? (
        <p className="rounded bg-green-50 p-4 text-green-800 empty:hidden">
          {state.message}
        </p>
      ) : (
        <p className="text-red-500 empty:hidden">{state.message}</p>
      )}
    </form>
  );
}

export default function ResetPasswordForm() {
  return (
    <Suspense fallback={<Spinner />}>
      <Form />
    </Suspense>
  );
}
