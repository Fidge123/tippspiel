import "~/styles/globals.css";
import Nav from "~/components/layout/nav";
import HamburgerMenu from "~/components/layout/nav/hamburger";
import LeagueSelector from "~/components/layout/nav/league-selector";

export default async function RootLayout({
  children,
  params,
}: Readonly<Props>) {
  const { league } = await params;
  const links = [
    { name: "Tippspiel", href: `/${league}`, active: true },
    { name: "Tabelle", href: `/${league}/leaderboard` },
    { name: "Divisions", href: `/${league}/divisions` },
  ];
  return (
    <>
      <Nav
        links={links}
        menu={
          <div className="flex items-center gap-3">
            <LeagueSelector selected={league} suffix={""} />
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
