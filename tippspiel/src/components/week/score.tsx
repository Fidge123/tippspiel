export function Score({ score }: Props) {
  return score ? (
    <div className="mx-auto flex gap-1 font-bold text-sm">
      <span>{score.away.total}</span>
      <span>@</span>
      <span>{score.home.total}</span>
    </div>
  ) : (
    <span className="flex items-center font-bold text-sm">@</span>
  );
}

interface Props {
  score?: {
    away: {
      total: number | null;
    };
    home: {
      total: number | null;
    };
  };
}
