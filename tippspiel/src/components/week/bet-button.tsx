import { Button } from "@headlessui/react";
import type { CSSProperties } from "react";
import { placeBetAction } from "~/components/week/bet-action";

export function BetButton({
  amount,
  team,
  selected,
  gameId,
  leagueId,
  week,
  disabled,
}: Props) {
  return (
    <form action={placeBetAction} className="rounded bg-white">
      <input type="hidden" name="gameId" value={gameId} />
      <input type="hidden" name="teamId" value={team.id} />
      <input type="hidden" name="value" value={amount} />
      <input type="hidden" name="leagueId" value={leagueId} />
      <input type="hidden" name="week" value={week} />
      <Button
        type="submit"
        disabled={disabled}
        className="size-9 cursor-pointer rounded disabled:cursor-not-allowed disabled:opacity-50"
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
        disabled
        className="size-9 cursor-pointer rounded"
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
  id?: number;
  color1: string | null;
  color2: string | null;
}

interface LoadingProps {
  amount: number;
  team: Team;
}

interface Props extends LoadingProps {
  selected: boolean;
  gameId: number;
  leagueId: string;
  week: string;
  disabled: boolean;
}
