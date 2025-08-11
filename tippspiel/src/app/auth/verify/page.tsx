"use client";

import { Button } from "@headlessui/react";
import { redirect, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import Spinner from "~/app/_components/spinner";
import { api } from "~/trpc/react";

function VerifyContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"load" | "success" | "error">("load");
  const [message, setMessage] = useState("");

  const verifyMutation = api.user.verify.useMutation({
    onSuccess: () => {
      setStatus("success");
      setMessage("Deine E-Mail-Adresse wurde erfolgreich bestätigt!");
    },
    onError: (error) => {
      setStatus("error");
      if (error.message === "Invalid verification token") {
        setMessage("Der Token ist ungültig.");
      } else if (error.message === "Verification token has expired") {
        setMessage("Der Token ist abgelaufen.");
      } else {
        setMessage("Ein unbekannter Fehler ist aufgetreten.");
      }
    },
  });

  const performVerification = useCallback(
    (token: string) => verifyMutation.mutate({ token }),
    [verifyMutation.mutate],
  );

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Kein Bestätigungstoken gefunden.");
    } else {
      performVerification(token);
    }
  }, [token, performVerification]);

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-10 text-center font-bold text-2xl/9 text-gray-900 tracking-tight">
          E-Mail-Adresse bestätigen
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <div className="space-y-6">
          {status === "load" && (
            <div className="text-center">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-current border-r-transparent border-solid align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
              <p className="mt-4 text-gray-600 text-sm">
                Ihre E-Mail-Adresse wird bestätigt...
              </p>
            </div>
          )}

          {status === "success" && (
            <div className="rounded bg-green-50 p-4">
              <p className="font-medium text-green-800 text-sm">{message}</p>
            </div>
          )}

          {status === "error" && (
            <div className="rounded bg-red-50 p-4">
              <p className="font-medium text-red-800 text-sm">{message}</p>
            </div>
          )}

          {(status === "success" || status === "error") && (
            <Button
              onClick={() => redirect("/auth/login")}
              className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 font-semibold text-sm/6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-indigo-600 focus-visible:outline-offset-2"
            >
              {status === "success" ? "Zur Anmeldung" : "Zurück"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <VerifyContent />
    </Suspense>
  );
}
