"use client";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Spinner from "~/components/ui/spinner";

function ErrorPage() {
  const search = useSearchParams();
  const error = search.get("error");

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center">
      <h1 className="mb-2 text-center font-bold text-xl">Anmeldefehler</h1>
      <p>
        {error === "Configuration"
          ? "Ein Serverfehler ist aufgetreten. Bitte melde dich beim Administrator und versuche es später erneut."
          : error === "AccessDenied"
            ? "Dein Account wurde gesperrt. Bitte melde dich beim Administrator."
            : error === "Verification"
              ? "Der Token ist nicht mehr gültig. Bitte fordere einen neuen Token an."
              : "Ein unbekannter Fehler ist aufgetreten. Bitte versuche es später erneut."}
      </p>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <ErrorPage />
    </Suspense>
  );
}
