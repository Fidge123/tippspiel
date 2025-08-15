import Link from "next/link";
import { auth } from "~/server/auth";

export default async function NavLinks() {
  const session = await auth();
  if (session) {
    return (
      <>
        <Link
          href="/leaderboard"
          className="p-1 hover:underline focus:underline focus:outline-none"
        >
          Tabelle
        </Link>
        <Link
          href="/divisions"
          className="p-1 hover:underline focus:underline focus:outline-none"
        >
          Divisions
        </Link>
      </>
    );
  }
}
