"use client";
import { Button, Field, Input, Label } from "@headlessui/react";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { resetPassword } from "../action";

export function ResetPasswordForm() {
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
          className="w-full rounded border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 data-invalid:outline-none data-invalid:ring-2 data-invalid:ring-red-500"
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
          className="w-full rounded border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 data-invalid:outline-none data-invalid:ring-2 data-invalid:ring-red-500"
        />
      </Field>

      <Button
        type="submit"
        disabled={pending}
        className="w-full rounded bg-blue-600 px-4 py-2 text-white shadow-sm hover:bg-blue-700 focus:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "Wird gesetzt..." : "Passwort setzen"}
      </Button>

      <p className="text-red-500 empty:hidden">{state.message}</p>
    </form>
  );
}
