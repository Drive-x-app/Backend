import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BookingResponseDto {
  @ApiProperty({ example: 'b1f7b9e0-82a1-42e5-bc02-9a3d132b145a' })
  id: string;

  @ApiProperty({ example: 'c1f7b9e0-82a1-42e5-bc02-9a3d132b145a' })
  customerId: string;

  @ApiProperty({ example: 'PENDING', enum: ['PENDING', 'SEARCHING', 'ACCEPTED', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] })
  status: string;

  @ApiProperty({ example: '2h' })
  durationId: string;

  @ApiProperty({ example: '2 Hours' })
  durationLabel: string;

  @ApiProperty({ example: 'Current Location (Gandhipuram, Coimbatore)' })
  pickupLocation: string;

  @ApiPropertyOptional({ example: 'Coimbatore Airport, Peelamedu', nullable: true })
  dropLocation?: string | null;

  @ApiPropertyOptional({ example: '2026-10-28', nullable: true })
  pickupDate?: string | null;

  @ApiPropertyOptional({ example: '10:30 AM', nullable: true })
  pickupTime?: string | null;

  @ApiProperty({ example: 'now', enum: ['now', 'later'] })
  timingMode: string;

  @ApiProperty({ example: 524 })
  fare: number;

  @ApiProperty({ example: 'INR' })
  currency: string;

  @ApiProperty({ example: 'UPI', enum: ['CASH', 'CARD', 'WALLET', 'UPI'] })
  paymentMethod: string;

  @ApiProperty({ example: 'PENDING', enum: ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'] })
  paymentStatus: string;

  @ApiPropertyOptional({ example: null, nullable: true, description: 'Assigned Driver UUID (null when unassigned)' })
  driverId?: string | null;

  @ApiPropertyOptional({ example: null, nullable: true, description: 'Assigned Driver Full Name' })
  driverName?: string | null;

  @ApiProperty({ example: '2026-10-27T10:00:00.000Z' })
  createdAt: Date;

  @ApiPropertyOptional({ example: null, nullable: true })
  completedAt?: Date | null;
}
