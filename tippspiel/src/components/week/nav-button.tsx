import Link from "next/link";

export function NavButton({ title, href, children }: Props) {
  if (href) {
    return (
      <Link
        title={title}
        href={href}
        className="inline-flex items-center gap-2 rounded-md bg-gray-100 px-3 py-2 text-gray-900 text-sm hover:bg-gray-200 focus:outline-2 focus:outline-blue-500"
      >
        {children}
      </Link>
    );
  }

  return (
    <div className="inline-flex cursor-not-allowed items-center gap-2 rounded-md bg-gray-50 px-3 py-2 text-gray-500 text-sm">
      {children}
    </div>
  );
}

interface Props {
  title: string;
  href?: string;
  children: React.ReactNode;
}
