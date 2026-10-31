import { IsString, IsNotEmpty, IsOptional, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBookingDto {
  @ApiProperty({ example: '2h', description: 'Duration package ID' })
  @IsString()
  @IsNotEmpty()
  durationId: string;

  @ApiProperty({ example: 'Current Location (Gandhipuram, Coimbatore)', description: 'Pickup address' })
  @IsString()
  @IsNotEmpty()
  pickupLocation: string;

  @ApiPropertyOptional({ example: 'Coimbatore Airport, Peelamedu', description: 'Optional drop address' })
  @IsString()
  @IsOptional()
  dropLocation?: string;

  @ApiPropertyOptional({ example: 'now', enum: ['now', 'later'], default: 'now' })
  @IsString()
  @IsOptional()
  @IsIn(['now', 'later'])
  timingMode?: 'now' | 'later';

  @ApiPropertyOptional({ example: '2026-10-28', description: 'Pickup date for advance bookings' })
  @IsString()
  @IsOptional()
  pickupDate?: string;

  @ApiPropertyOptional({ example: '10:30 AM', description: 'Pickup time for advance bookings' })
  @IsString()
  @IsOptional()
  pickupTime?: string;

  @ApiPropertyOptional({
    example: 'UPI',
    enum: ['CASH', 'CARD', 'WALLET', 'UPI'],
    default: 'UPI',
    description: 'Chosen payment method',
  })
  @IsString()
  @IsOptional()
  @IsIn(['CASH', 'CARD', 'WALLET', 'UPI'])
  paymentMethod?: 'CASH' | 'CARD' | 'WALLET' | 'UPI';
}
