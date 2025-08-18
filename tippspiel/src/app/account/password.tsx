"use client";
import {
  Button,
  Description,
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
  Field,
  Input,
  Label,
} from "@headlessui/react";
import { PencilIcon } from "@heroicons/react/24/outline";
import { signOut } from "next-auth/react";
import { useActionState, useEffect, useState } from "react";
import { updatePassword } from "./password-action";

export function PasswordForm() {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(updatePassword, "");

  useEffect(() => {
    if (state.includes("erfolgreich")) {
      setTimeout(() => signOut({ redirectTo: "/auth/login" }), 3000);
    }
  }, [state]);

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="cursor-pointer p-1 text-blue-500 hover:text-blue-800 focus:text-blue-800"
      >
        <PencilIcon className="size-4" />
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        transition
        className="relative z-10 transition data-closed:opacity-0"
      >
        <DialogBackdrop className="fixed inset-0 bg-black/10" />
        <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
          <DialogPanel className="max-w-lg space-y-4 rounded-lg bg-white p-8">
            <DialogTitle className="font-bold">Passwort ändern</DialogTitle>
            <Description>
              Das Passwort wird für die Anmeldung und den Zugriff auf dein Konto
              verwendet. Du wirst nach der Änderung abgemeldet und musst dich
              mit dem neuen Passwort erneut anmelden.
            </Description>
            <form action={action} className="w-full text-gray-900">
              <Field>
                <Label>Altes Passwort</Label>
                <Input
                  autoFocus
                  name="old"
                  type="password"
                  minLength={8}
                  maxLength={64}
                  autoComplete="password"
                  invalid={state.includes("altes Passwort")}
                  required
                  className="mb-6 w-full rounded border border-gray-300 px-3 py-2 shadow-sm focus:outline-2 focus:outline-blue-500 data-invalid:outline-2 data-invalid:outline-red-500"
                />
              </Field>
              <Field>
                <Label>Neues Passwort</Label>
                <Input
                  name="new"
                  type="password"
                  minLength={8}
                  maxLength={64}
                  autoComplete="password"
                  required
                  className="mb-6 w-full rounded border border-gray-300 px-3 py-2 shadow-sm focus:outline-2 focus:outline-blue-500 data-invalid:outline-2 data-invalid:outline-red-500"
                />
              </Field>
              <Field>
                <Label>Neues Passwort bestätigen</Label>
                <Input
                  name="check"
                  type="password"
                  minLength={8}
                  maxLength={64}
                  autoComplete="password"
                  invalid={state.includes("übereinstimmen")}
                  required
                  className="mb-6 w-full rounded border border-gray-300 px-3 py-2 shadow-sm focus:outline-2 focus:outline-blue-500 data-invalid:outline-2 data-invalid:outline-red-500"
                />
              </Field>

              <div className="flex w-full justify-end gap-4">
                <Button
                  type="submit"
                  disabled={pending}
                  className="rounded bg-blue-600 px-4 py-2 text-white shadow-sm hover:bg-blue-700 focus:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Speichern
                </Button>
                <Button
                  type="button"
                  disabled={pending}
                  onClick={() => setOpen(false)}
                  className="rounded bg-gray-300 px-4 py-2 text-black shadow-sm hover:bg-gray-400 focus:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Schließen
                </Button>
              </div>

              <p className="not-empty:pt-6 text-red-500 empty:hidden">
                {state}
              </p>
            </form>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
}
