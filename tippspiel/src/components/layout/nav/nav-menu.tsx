import Link from "next/link";
import { auth } from "~/server/auth";
import HamburgerMenu from "./hamburger";

export default async function NavMenu() {
  const session = await auth();

  return session ? (
    <HamburgerMenu />
  ) : (
    <Link
      href="/auth/login"
      className="rounded-full bg-white px-4 py-1 font-semibold text-black transition hover:bg-gray-200 focus:outline-2 focus:outline-blue-500"
    >
      Anmelden
    </Link>
  );
}
