"use client";
import { Button, Field, Input, Label } from "@headlessui/react";
import { useActionState } from "react";
import { forgotPassword } from "./action";

export default function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(forgotPassword, {
    email: ["", false],
    message: undefined,
    success: false,
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
          className="w-full rounded border border-gray-300 px-3 py-2 shadow-sm focus:outline-2 focus:outline-blue-500 data-invalid:outline-2 data-invalid:outline-red-500"
        />
      </Field>

      <Button
        type="submit"
        disabled={pending || state.success}
        className="w-full rounded bg-blue-600 px-4 py-2 text-white shadow-sm hover:bg-blue-700 focus:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "Wird gesendet..." : "Zurücksetzen"}
      </Button>

      <p
        className={`${state.success ? "text-green-600" : "text-red-500"} empty:hidden`}
      >
        {state.message}
      </p>
    </form>
  );
}
