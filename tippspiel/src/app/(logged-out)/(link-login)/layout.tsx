import "~/styles/globals.css";
import Nav from "~/components/layout/nav";
import Login from "./login";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Nav links={[{ name: "Tippspiel", href: "/" }]} menu={<Login />} />
      {children}
    </>
  );
}
