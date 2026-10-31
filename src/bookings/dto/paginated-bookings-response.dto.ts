import { ApiProperty } from '@nestjs/swagger';
import { BookingResponseDto } from './booking-response.dto.js';

export class PaginatedBookingsResponseDto {
  @ApiProperty({ type: [BookingResponseDto] })
  items: BookingResponseDto[];

  @ApiProperty({ example: 42, description: 'Total number of matching bookings' })
  total: number;

  @ApiProperty({ example: 1, description: 'Current page number' })
  page: number;

  @ApiProperty({ example: 10, description: 'Number of items per page' })
  limit: number;

  @ApiProperty({ example: 5, description: 'Total number of pages' })
  totalPages: number;
}
