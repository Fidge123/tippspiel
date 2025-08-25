import "~/styles/globals.css";
import Nav from "~/components/layout/nav";
import Register from "./register";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Nav links={[{ name: "Tippspiel", href: "/" }]} menu={<Register />} />
      {children}
    </>
  );
}
