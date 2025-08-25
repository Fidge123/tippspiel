import "~/styles/globals.css";
import Nav from "~/components/layout/nav";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Nav links={[{ name: "Tippspiel", href: "/" }]} />
      {children}
    </>
  );
}
