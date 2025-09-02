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
          className="mx-auto mb-1 size-6 sm:row-span-2 sm:my-0 sm:mr-1 sm:ml-2 sm:size-7"
        />
      ) : (
        <QuestionMarkCircleIcon className="mx-auto mb-1 size-6 sm:row-span-2 sm:my-0 sm:mr-1 sm:ml-2 sm:size-7" />
      )}

      <div className="flex text-sm">
        <span className="hidden sm:block">{away.name}</span>
        <span className="block sm:hidden">{away.shortName}</span>
      </div>
      <Score score={scores} />
      <div className="flex justify-end text-sm">
        <span className="hidden sm:block">{home.name}</span>
        <span className="block sm:hidden">{home.shortName}</span>
      </div>
      {home.logo ? (
        <Image
          src={home.logo}
          alt={home.name}
          width={28}
          height={28}
          className="mx-auto mb-1 size-6 sm:row-span-2 sm:my-0 sm:mr-2 sm:ml-1 sm:size-7"
        />
      ) : (
        <QuestionMarkCircleIcon className="mx-auto mb-1 size-6 sm:row-span-2 sm:my-0 sm:mr-2 sm:ml-1 sm:size-7" />
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
