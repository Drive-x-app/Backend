import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { BookingStatus } from '@prisma/client';

export class QueryBookingsDto {
  @ApiPropertyOptional({ description: 'Page number (default 1)', example: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page (default 10)', example: 10, minimum: 1, maximum: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Filter bookings by status',
    enum: BookingStatus,
    example: 'COMPLETED',
  })
  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;
}
