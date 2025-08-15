"use client";
import { Button, Field, Input, Label } from "@headlessui/react";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { resendVerificationEmail } from "./action";
import Success from "./success";

export default function Form() {
  const searchParams = useSearchParams();
  const emailFromUrl = searchParams.get("email") ?? "";

  const initialState = {
    email: [emailFromUrl, false] as [string, boolean],
    message: undefined as string | undefined,
    success: undefined as boolean | undefined,
  };

  const [state, formAction, pending] = useActionState(
    resendVerificationEmail,
    initialState,
  );

  if (state.success) {
    return <Success message={state.message} />;
  }

  return (
    <form action={formAction} className="space-y-4">
      <Field className="space-y-1">
        <Label>E-Mail-Adresse</Label>
        <Input
          name="email"
          type="email"
          required
          autoComplete="email"
          defaultValue={state.email[0]}
          invalid={state.email[1]}
          className="w-full rounded border border-gray-300 px-3 py-2 shadow-sm focus:outline-2 focus:outline-blue-500 data-invalid:outline-2 data-invalid:outline-red-500"
        />
      </Field>

      {state.message && (
        <div className="rounded bg-red-50 p-4">
          <p className="font-medium text-red-800 text-sm">{state.message}</p>
        </div>
      )}

      <Button
        type="submit"
        disabled={pending}
        className="flex w-full justify-center rounded-md bg-blue-600 px-3 py-1.5 font-semibold text-sm/6 text-white shadow-sm hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:outline-offset-2 disabled:bg-blue-400"
      >
        {pending ? "Wird gesendet..." : "Bestätigungs-E-Mail senden"}
      </Button>
    </form>
  );
}
