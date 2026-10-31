import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FareEstimateResponseDto {
  @ApiProperty({ example: '2h' })
  durationId: string;

  @ApiProperty({ example: '2 Hours' })
  durationLabel: string;

  @ApiProperty({ example: 2 })
  hours: number;

  @ApiProperty({ example: 499 })
  baseFare: number;

  @ApiProperty({ example: 25, description: '5% GST breakdown' })
  taxes: number;

  @ApiProperty({ example: 524, description: 'Total authoritative fare including taxes' })
  estimatedTotalFare: number;

  @ApiProperty({ example: 'INR' })
  currency: string;

  @ApiProperty({ example: '123, Anna Nagar, Coimbatore' })
  pickupLocation: string;

  @ApiPropertyOptional({ example: 'RS Puram, Coimbatore', nullable: true })
  dropLocation?: string | null;
}
