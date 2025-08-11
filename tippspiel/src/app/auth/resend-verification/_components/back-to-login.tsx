import Link from "next/link";

export default function BackToLogin() {
  return (
    <div className="text-center">
      <Link href="/login" className="w-full text-indigo-500 hover:underline">
        Zurück zur Anmeldung
      </Link>
    </div>
  );
}
