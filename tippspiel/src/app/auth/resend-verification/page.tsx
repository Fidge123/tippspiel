"use client";

import { Button, Field, Input, Label } from "@headlessui/react";
import { useSearchParams } from "next/navigation";
import { Suspense, useActionState } from "react";
import Spinner from "~/app/_components/spinner";
import BackToLogin from "./_components/back-to-login";
import { resendVerificationEmail } from "./action";

function ResendVerificationContent() {
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

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center space-y-4 p-6">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="text-center font-bold text-2xl text-gray-900 tracking-tight">
          Bestätigungs-E-Mail erneut senden
        </h2>
        <p className="mt-2 text-center text-gray-600 text-sm">
          Geben Sie Ihre E-Mail-Adresse ein, um eine neue Bestätigungs-E-Mail zu
          erhalten
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        {state.success ? (
          <div className="space-y-6">
            <div className="rounded bg-green-50 p-4">
              <p className="font-medium text-green-800 text-sm">
                {state.message}
              </p>
              <p className="mt-2 text-green-800 text-sm">
                Bitte überprüfen Sie Ihr E-Mail-Postfach und klicken Sie auf den
                Bestätigungslink.
              </p>
            </div>

            <BackToLogin />
          </div>
        ) : (
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
                className="w-full rounded border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 data-invalid:outline-none data-invalid:ring-2 data-invalid:ring-red-500"
              />
            </Field>

            {state.message && (
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

            <BackToLogin />
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResendVerificationPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <ResendVerificationContent />
    </Suspense>
  );
}
