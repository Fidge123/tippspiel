import { ApiProperty } from '@nestjs/swagger';

export class UpdateScoreboard {
  @ApiProperty()
  week: number;

  @ApiProperty({ required: false })
  season?: number;

  @ApiProperty({ required: false })
  type?: number;
}
