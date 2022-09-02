export class CreateBetDto {
  gameId: string;
  leagueId: string;
  winner: 'home' | 'away';
  pointDiff: number;
}
