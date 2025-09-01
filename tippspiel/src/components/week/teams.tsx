import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { Score } from "./score";

export function Teams({ away, home, scores }: Props) {
  return (
    <>
      {away.logo ? (
        <Image
          src={away.logo}
          alt={away.name}
          width={28}
          height={28}
          className="size-7 sm:row-span-2"
        />
      ) : (
        <QuestionMarkCircleIcon className="size-7 sm:row-span-2" />
      )}

      <div className="flex px-2 text-sm">
        <span className="hidden sm:block">{away.name}</span>
        <span className="block sm:hidden">{away.shortName}</span>
      </div>
      <Score score={scores} />
      <div className="flex justify-end px-2 text-sm">
        <span className="hidden sm:block">{home.name}</span>
        <span className="block sm:hidden">{home.shortName}</span>
      </div>
      {home.logo ? (
        <Image
          src={home.logo}
          alt={home.name}
          width={28}
          height={28}
          className="size-7 sm:row-span-2"
        />
      ) : (
        <QuestionMarkCircleIcon className="size-7 sm:row-span-2" />
      )}
    </>
  );
}

interface Props {
  away: {
    logo: string | null;
    name: string;
    shortName: string;
  };
  home: {
    logo: string | null;
    name: string;
    shortName: string;
  };
  scores?: {
    away: {
      total: number | null;
    };
    home: {
      total: number | null;
    };
  };
}
