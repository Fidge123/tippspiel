import Link from "next/link";
import { auth, signIn } from "~/server/auth";
import HamburgerMenu from "./menu";

export default async function Nav() {
  const session = await auth();

  return (
    <header className="pointer-events-auto fixed h-12 w-screen bg-gray-900 px-4 text-white">
      <nav className="flex h-full items-center justify-between">
        <div className="space-x-4">
          <Link href="/" className="font-bold no-underline">
            Tippspiel
          </Link>
          {session && (
            <>
              <Link href="/leaderboard" className="font-semibold no-underline">
                Tabelle
              </Link>
              <Link href="/divisions" className="font-semibold no-underline">
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
            className="rounded-full bg-white px-4 py-1 font-semibold text-black transition hover:bg-gray-200"
          >
            Anmelden
          </Link>
        )}
      </nav>
    </header>
  );
}
