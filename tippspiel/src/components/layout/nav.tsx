import Link from "next/link";
import { Suspense } from "react";
import NavLinks from "./nav/nav-links";
import NavMenu from "./nav/nav-menu";

export default async function Nav() {
  return (
    <header className="pointer-events-auto fixed h-12 w-screen bg-gray-900 px-4 text-white">
      <nav className="flex h-full items-center justify-between">
        <div className="space-x-2 font-semibold decoration-dashed underline-offset-6">
          <Link
            href="/"
            className="p-1 font-semibold underline-offset-6 hover:underline focus:underline focus:outline-none"
          >
            Tippspiel
          </Link>
          <Suspense>
            <NavLinks />
          </Suspense>
        </div>
        <Suspense
          fallback={
            <div className="h-8 w-8 animate-pulse rounded-full bg-gray-300" />
          }
        >
          <NavMenu />
        </Suspense>
      </nav>
    </header>
  );
}
