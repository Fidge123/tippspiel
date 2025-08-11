"use client";

import { Button, Description, Field, Input, Label } from "@headlessui/react";
import Link from "next/link";
import { useActionState } from "react";
import { resendVerificationEmail } from "./action";

const initialState = {
  email: ["", false] as [string, boolean],
  message: undefined as string | undefined,
  success: undefined as boolean | undefined,
};

export default function ResendVerificationPage() {
  const [state, formAction, pending] = useActionState(
    resendVerificationEmail,
    initialState,
  );

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-10 text-center font-bold text-2xl/9 text-gray-900 tracking-tight">
          Bestätigungs-E-Mail erneut senden
        </h2>
        <p className="mt-2 text-center text-gray-600 text-sm">
          Geben Sie Ihre E-Mail-Adresse ein, um eine neue Bestätigungs-E-Mail zu
          erhalten
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        {state.success ? (
          <div className="space-y-6">
            <div className="rounded bg-green-50 p-4">
              <div className="ml-3">
                <p className="font-medium text-green-800 text-sm">
                  {state.message}
                </p>
                <p className="mt-2 text-green-800 text-sm">
                  Bitte überprüfen Sie Ihr E-Mail-Postfach und klicken Sie auf
                  den Bestätigungslink.
                </p>
              </div>
            </div>

            <div className="text-center">
              <Link
                href="/auth/login"
                className="font-semibold text-indigo-600 text-sm hover:text-indigo-500"
              >
                Zur Anmeldung
              </Link>
            </div>
          </div>
        ) : (
          <form action={formAction} className="space-y-6">
            <Field>
              <Label className="block font-medium text-gray-900 text-sm/6">
                E-Mail-Adresse
              </Label>
              <div className="mt-2">
                <Input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  defaultValue={state.email[0]}
                  invalid={state.email[1]}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 focus:ring-inset data-[invalid]:ring-red-300 data-[invalid]:focus:ring-red-500 sm:text-sm/6"
                />
              </div>
              {state.email[1] && state.message && (
                <Description className="mt-2 text-red-800 text-sm">
                  {state.message}
                </Description>
              )}
            </Field>

            {state.message && !state.email[1] && (
              <div className="rounded bg-red-50 p-4">
                <p className="font-medium text-red-800 text-sm">
                  {state.message}
                </p>
              </div>
            )}

            <Button
              type="submit"
              disabled={pending}
              className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 font-semibold text-sm/6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-indigo-600 focus-visible:outline-offset-2 disabled:bg-indigo-400"
            >
              {pending ? "Wird gesendet..." : "Bestätigungs-E-Mail senden"}
            </Button>

            <div className="text-center">
              <Link
                href="/auth/login"
                className="font-semibold text-indigo-600 text-sm hover:text-indigo-500"
              >
                Zurück zur Anmeldung
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
