import Link from "next/link";

export default async function ErrorPage() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4">
      <h1 className="mb-2 text-center font-bold text-xl">Anmeldefehler</h1>
      <p>Bei der Authentifizierung ist ein Fehler aufgetreten.</p>
      <Link href="/" className="text-blue-600 underline hover:text-blue-500" />
    </div>
  );
}
