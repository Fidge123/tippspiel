import "~/styles/globals.css";
import Link from "next/link";

export default function Register() {
  return (
    <Link
      href="/auth/register"
      className="rounded-full bg-white px-4 py-1 font-semibold text-black transition hover:bg-gray-200 focus:outline-2 focus:outline-blue-500"
    >
      Registrieren
    </Link>
  );
}
