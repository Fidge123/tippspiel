import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-8">
      <div className="w-full max-w-md space-y-2 text-center">
        <h1 className="text-bold text-xl">404 Not Found</h1>
        <p>Seite konnte nicht gefunden werden</p>
        <Link href="/" className="text-blue-500 underline">
          Zurück zur Startseite
        </Link>
      </div>
    </main>
  );
}
