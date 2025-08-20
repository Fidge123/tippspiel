import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { signOut } from "~/server/auth";

export default async function HamburgerMenu() {
  const links = [
    { href: "/account", label: "Account" },
    { href: "/leagues", label: "Ligen" },
    { href: "/rules", label: "Regeln" },
    { href: "/impressum", label: "Impressum" },
  ];
  return (
    <Menu>
      <MenuButton
        title="Menü"
        className="rounded-full outline-offset-2 focus:outline-2 focus:outline-blue-500"
      >
        <UserCircleIcon className="size-8 rounded-full hover:bg-gray-600" />
      </MenuButton>
      <MenuItems
        transition
        anchor="bottom end"
        className="flex origin-top-right flex-col items-start rounded-lg bg-gray-800/90 p-1 text-left text-white shadow transition [--anchor-gap:12px] focus:outline-none data-closed:scale-95 data-closed:opacity-0"
      >
        {links.map(({ href, label }) => (
          <MenuItem key={href}>
            <Link
              href={href}
              className="w-full rounded p-2 pr-4 data-focus:bg-white/10"
            >
              {label}
            </Link>
          </MenuItem>
        ))}
        <MenuItem>
          <button
            type="button"
            className="w-full cursor-pointer rounded p-2 text-left data-focus:bg-white/10"
            onClick={async () => {
              "use server";
              await signOut();
            }}
          >
            Abmelden
          </button>
        </MenuItem>
      </MenuItems>
    </Menu>
  );
}
