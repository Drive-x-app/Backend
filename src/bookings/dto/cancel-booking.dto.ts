import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CancelBookingDto {
  @ApiPropertyOptional({
    description: 'Reason for booking cancellation',
    example: 'Change of plans',
  })
  @IsOptional()
  @IsString()
  reason?: string;
}
