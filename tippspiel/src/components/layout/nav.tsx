import Link from "next/link";

export default async function Nav({ links, menu }: Props) {
  return (
    <header className="pointer-events-auto fixed h-12 w-screen bg-gray-900 px-4 text-white">
      <nav className="flex h-full items-center justify-between">
        <div className="space-x-2 font-semibold decoration-dashed underline-offset-6">
          {links.map(({ href, name }) => (
            <Link
              key={href}
              href={href}
              className="p-1 font-semibold underline-offset-6 hover:underline focus:underline focus:outline-none"
            >
              {name}
            </Link>
          ))}
        </div>
        {menu}
      </nav>
    </header>
  );
}

interface Props {
  links: {
    name: string;
    href: string;
  }[];
  menu?: React.ReactNode;
}
