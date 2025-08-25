import "~/styles/globals.css";
import Nav from "~/components/layout/nav";
import HamburgerMenu from "~/components/layout/nav/hamburger";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const links = [
    { name: "Tippspiel", href: "/" },
    { name: "Tabelle", href: "/leaderboard" },
    { name: "Divisions", href: "/divisions" },
  ];
  return (
    <>
      <Nav links={links} menu={<HamburgerMenu />} />
      {children}
    </>
  );
}
