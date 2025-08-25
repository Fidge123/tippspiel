import "~/styles/globals.css";
import Nav from "~/components/layout/nav";
import HamburgerMenu from "~/components/layout/nav/hamburger";
import LeagueSelector from "~/components/layout/nav/league-selector";

export default async function RootLayout({
  children,
  params,
}: Readonly<Props>) {
  const leagueId = (await params).league;
  const links = [
    { name: "Tippspiel", href: "/" },
    { name: "Tabelle", href: "/leaderboard" },
    { name: "Divisions", href: "/divisions" },
  ];
  return (
    <>
      <Nav
        links={links}
        menu={
          <div className="flex items-center gap-3">
            <LeagueSelector selected={leagueId} />
            <HamburgerMenu />
          </div>
        }
      />
      {children}
    </>
  );
}

interface Props {
  children: React.ReactNode;
  params: Promise<{ league: string }>;
}
