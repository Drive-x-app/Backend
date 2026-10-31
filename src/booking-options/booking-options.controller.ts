import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { BookingOptionsService } from './booking-options.service.js';
import { DurationOptionResponseDto } from './dto/duration-option-response.dto.js';

@ApiTags('Booking Options')
@Controller('booking-options')
export class BookingOptionsController {
  constructor(private readonly bookingOptionsService: BookingOptionsService) {}

  /**
   * GET /api/v1/booking-options/durations
   */
  @Get('durations')
  @ApiOperation({
    summary: 'Get available driver booking durations',
    description:
      'Returns the 5 driver hire duration options shown in the design: 1 Hour, 2 Hours, 4 Hours, 6 Hours, and Full Day (12h).',
  })
  @ApiResponse({
    status: 200,
    description: 'List of available duration packages with pricing',
    type: [DurationOptionResponseDto],
  })
  async getDurations(): Promise<DurationOptionResponseDto[]> {
    return this.bookingOptionsService.getDurations();
  }

  /**
   * GET /api/v1/booking-options/durations/:id
   */
  @Get('durations/:id')
  @ApiOperation({
    summary: 'Get a specific duration package by ID',
    description: 'Resolves package details, hours, base fare and availability for an ID.',
  })
  @ApiParam({ name: 'id', example: '2h', description: 'Duration package ID (e.g. 1h, 2h, 4h, 6h, fullday)' })
  @ApiResponse({ status: 200, description: 'Duration package details', type: DurationOptionResponseDto })
  @ApiResponse({ status: 404, description: 'Duration package not found' })
  async findOne(@Param('id') id: string): Promise<DurationOptionResponseDto> {
    return this.bookingOptionsService.findOne(id);
  }
}
