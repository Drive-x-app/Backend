import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { BookingStatus } from '@prisma/client';

export class UpdateBookingStatusDto {
  @ApiProperty({
    description: 'Target booking state transition',
    enum: BookingStatus,
    example: 'ACCEPTED',
  })
  @IsEnum(BookingStatus)
  status: BookingStatus;

  @ApiPropertyOptional({
    description: 'Driver UUID if assigning driver during transition',
    example: 'd1f7b9e0-82a1-42e5-bc02-9a3d132b145a',
  })
  @IsOptional()
  @IsUUID()
  driverId?: string;
}
