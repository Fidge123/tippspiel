import Link from "next/link";
import { Suspense } from "react";
import Form from "./form";
import Loading from "./form-loading";

export default function ResendVerification() {
  return (
    <div className="m-auto flex min-h-full max-w-prose flex-1 flex-col justify-center space-y-8">
      <div className="space-y-4 text-center">
        <h2 className="font-bold text-2xl text-gray-900">
          Bestätigungs-E-Mail erneut senden
        </h2>
        <p className="text-gray-600 text-sm">
          Geben Sie Ihre E-Mail-Adresse ein, um eine neue Bestätigungs-E-Mail zu
          erhalten
        </p>
      </div>

      <Suspense fallback={<Loading />}>
        <Form />
      </Suspense>

      <Link
        href="/auth/login"
        className="w-full text-center text-blue-600 hover:underline"
      >
        Zurück zur Anmeldung
      </Link>
    </div>
  );
}
