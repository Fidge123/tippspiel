import { ApiProperty } from '@nestjs/swagger';

export class GetGames {
  @ApiProperty()
  week: number;

  @ApiProperty({ required: false })
  season?: number;

  @ApiProperty({ required: false })
  type?: number;
}
