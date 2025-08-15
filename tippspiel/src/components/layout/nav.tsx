import Link from "next/link";
import HamburgerMenu from "~/components/layout/menu";
import { auth } from "~/server/auth";

export default async function Nav() {
  const session = await auth();

  return (
    <header className="pointer-events-auto fixed h-12 w-screen bg-gray-900 px-4 text-white">
      <nav className="flex h-full items-center justify-between">
        <div className="space-x-2">
          <Link
            href="/"
            className="rounded p-1 font-bold no-underline focus:outline-2 focus:outline-blue-500"
          >
            Tippspiel
          </Link>
          {session && (
            <>
              <Link
                href="/leaderboard"
                className="rounded p-1 font-semibold no-underline focus:outline-2 focus:outline-blue-500"
              >
                Tabelle
              </Link>
              <Link
                href="/divisions"
                className="rounded p-1 font-semibold no-underline focus:outline-2 focus:outline-blue-500"
              >
                Divisions
              </Link>
            </>
          )}
        </div>
        {session ? (
          <HamburgerMenu />
        ) : (
          <Link
            href="/auth/login"
            className="rounded-full bg-white px-4 py-1 font-semibold text-black transition hover:bg-gray-200 focus:outline-2 focus:outline-blue-500"
          >
            Anmelden
          </Link>
        )}
      </nav>
    </header>
  );
}
