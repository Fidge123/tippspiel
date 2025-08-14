import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import Link from "next/link";
import { signOut } from "~/server/auth";

export default async function HamburgerMenu() {
  return (
    <Menu>
      <MenuButton className="p-2">🍔</MenuButton>
      <MenuItems
        transition
        anchor="bottom end"
        className="flex origin-top-right flex-col items-start space-y-2 rounded bg-gray-800 p-4 text-white shadow transition data-closed:scale-95 data-closed:opacity-0"
      >
        <MenuItem>
          <Link href="/account">Account</Link>
        </MenuItem>
        <MenuItem>
          <Link href="/leagues">Ligen</Link>
        </MenuItem>
        <MenuItem>
          <Link href="/rules">Regeln</Link>
        </MenuItem>
        <MenuItem>
          <Link href="/impressum">Impressum</Link>
        </MenuItem>
        <MenuItem>
          <button
            type="button"
            className="cursor-pointer"
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
