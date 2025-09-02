import { Button } from "@headlessui/react";
import type { CSSProperties } from "react";

export function BetButton({ amount, team, selected }: Props) {
  return (
    <form className="rounded bg-white">
      <Button
        className="cursor-pointer rounded px-2"
        style={style(team, amount, selected)}
      >
        {amount}
      </Button>
    </form>
  );
}

export function BetButtonLoading({ amount, team }: LoadingProps) {
  return (
    <form className="rounded bg-white">
      <Button
        className="cursor-pointer rounded px-2"
        style={style(team, amount, false)}
      >
        {amount}
      </Button>
    </form>
  );
}

function style(
  { color1 }: Team,
  num: number,
  selected: boolean,
): CSSProperties {
  return selected
    ? {
        backgroundColor: `oklch(from ${color1 ?? "#000"} 0.6 c h / ${num / 10 + 0.2})`,
        border: `solid 2px oklch(from ${color1 ?? "#000"} 0.6 c h / ${num / 10 + 0.2})`,
      }
    : {
        border: `solid 2px oklch(from ${color1 ?? "#000"} 0.6 c h / ${num / 10 + 0.2})`,
      };
}

interface Team {
  color1: string | null;
  color2: string | null;
}

interface LoadingProps {
  amount: number;
  team: Team;
}

interface Props extends LoadingProps {
  selected: boolean;
}
