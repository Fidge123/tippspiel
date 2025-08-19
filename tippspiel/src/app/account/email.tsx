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
import { useActionState, useEffect, useState } from "react";
import { updateEmail } from "./email-action";

export function EmailForm({ email }: { email: string }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(updateEmail, {
    email,
    message: undefined,
  });

  useEffect(() => {
    if (!open && state.message?.includes("erfolgreich")) {
      location.reload();
    }
  }, [open, state]);

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="w-fit cursor-pointer p-1 text-blue-500 hover:text-blue-800 focus:text-blue-800"
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
            <DialogTitle className="font-bold">
              E-Mail-Adresse ändern
            </DialogTitle>
            <Description>
              Die neue E-Mail-Adresse muss wieder verifiziert werden. Die alte
              Adresse wird über die Änderung informiert.
            </Description>
            <form action={action} className="w-full text-gray-900">
              <Field>
                <Label className="hidden">E-Mail-Adresse</Label>
                <Input
                  autoFocus
                  name="email"
                  type="email"
                  autoComplete="email"
                  defaultValue={state.email}
                  maxLength={256}
                  invalid={state.message?.includes("Fehler")}
                  required
                  className="my-4 w-full rounded border border-gray-300 px-3 py-2 shadow-sm focus:outline-2 focus:outline-blue-500 data-invalid:outline-2 data-invalid:outline-red-500"
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

              <p
                className={`${state.message?.includes("Fehler") ? "text-red-500" : "text-gray-500"} not-empty:pt-6 empty:hidden`}
              >
                {state.message}
              </p>
            </form>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
}
