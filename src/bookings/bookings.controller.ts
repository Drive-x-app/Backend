import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { BookingsService } from './bookings.service.js';
import { EstimateFareDto } from './dto/estimate-fare.dto.js';
import { CreateBookingDto } from './dto/create-booking.dto.js';
import { FareEstimateResponseDto } from './dto/fare-estimate-response.dto.js';
import { BookingResponseDto } from './dto/booking-response.dto.js';
import { CancelBookingDto } from './dto/cancel-booking.dto.js';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto.js';
import { QueryBookingsDto } from './dto/query-bookings.dto.js';
import { PaginatedBookingsResponseDto } from './dto/paginated-bookings-response.dto.js';
import { RateDriverDto } from './dto/rate-driver.dto.js';

@ApiTags('Bookings')
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  /**
   * POST /api/v1/bookings/estimate
   */
  @Post('estimate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Calculate authoritative fare estimate',
    description:
      'Calculates base fare, 5% GST taxes, and total fare based on the duration package and pickup location without persisting a booking.',
  })
  @ApiBody({ type: EstimateFareDto })
  @ApiResponse({ status: 200, description: 'Authoritative fare calculation breakdown', type: FareEstimateResponseDto })
  @ApiResponse({ status: 404, description: 'Duration package not found' })
  async estimateFare(@Body() dto: EstimateFareDto): Promise<FareEstimateResponseDto> {
    return this.bookingsService.estimateFare(dto);
  }

  /**
   * POST /api/v1/bookings
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Book a Driver (Create Booking)',
    description:
      'Creates a new chauffeured driver booking request in PostgreSQL with initial PENDING status for immediate or scheduled dispatch.',
  })
  @ApiBody({ type: CreateBookingDto })
  @ApiQuery({ name: 'userId', required: false, description: 'Optional Customer UUID for dev testing' })
  @ApiResponse({ status: 201, description: 'Booking request created successfully', type: BookingResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid booking data (e.g. missing scheduled date/time)' })
  @ApiResponse({ status: 404, description: 'Duration package not found' })
  async create(
    @Body() dto: CreateBookingDto,
    @Query('userId') userId?: string,
  ): Promise<BookingResponseDto> {
    const customerId = await this.bookingsService.resolveCustomerId(userId);
    return this.bookingsService.create(dto, customerId);
  }

  /**
   * GET /api/v1/bookings/recent
   */
  @Get('recent')
  @ApiOperation({
    summary: 'Get recent bookings summary',
    description: 'Retrieves the latest 5 bookings scoped to the customer for the home screen card.',
  })
  @ApiQuery({ name: 'userId', required: false, description: 'Optional Customer UUID for dev testing' })
  @ApiResponse({ status: 200, description: 'List of recent bookings', type: [BookingResponseDto] })
  async getRecent(@Query('userId') userId?: string): Promise<BookingResponseDto[]> {
    const customerId = await this.bookingsService.resolveCustomerId(userId);
    return this.bookingsService.getRecent(customerId);
  }

  /**
   * GET /api/v1/bookings
   */
  @Get()
  @ApiOperation({
    summary: 'Get customer trip history',
    description: 'Retrieves paginated booking records scoped to the customer with optional status filtering.',
  })
  @ApiQuery({ name: 'userId', required: false, description: 'Optional Customer UUID for dev testing' })
  @ApiResponse({ status: 200, description: 'Paginated customer bookings', type: PaginatedBookingsResponseDto })
  async findAll(
    @Query() query: QueryBookingsDto,
    @Query('userId') userId?: string,
  ): Promise<PaginatedBookingsResponseDto> {
    const customerId = await this.bookingsService.resolveCustomerId(userId);
    return this.bookingsService.findAll(query, customerId);
  }

  /**
   * GET /api/v1/bookings/:id
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get booking details by ID',
    description: 'Retrieves full details for a single booking scoped to the customer.',
  })
  @ApiParam({ name: 'id', description: 'Booking UUID' })
  @ApiQuery({ name: 'userId', required: false, description: 'Optional Customer UUID for dev testing' })
  @ApiResponse({ status: 200, description: 'Booking details', type: BookingResponseDto })
  @ApiResponse({ status: 403, description: 'Forbidden from viewing another customer booking' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('userId') userId?: string,
  ): Promise<BookingResponseDto> {
    const customerId = await this.bookingsService.resolveCustomerId(userId);
    return this.bookingsService.findOne(id, customerId);
  }

  /**
   * PATCH /api/v1/bookings/:id/cancel
   */
  @Patch(':id/cancel')
  @ApiOperation({
    summary: 'Cancel a booking',
    description: 'Allows a customer to cancel an active booking adhering to domain state transitions.',
  })
  @ApiParam({ name: 'id', description: 'Booking UUID' })
  @ApiBody({ type: CancelBookingDto })
  @ApiQuery({ name: 'userId', required: false, description: 'Optional Customer UUID for dev testing' })
  @ApiResponse({ status: 200, description: 'Booking cancelled successfully', type: BookingResponseDto })
  @ApiResponse({ status: 400, description: 'Booking cannot be cancelled (already completed or cancelled)' })
  @ApiResponse({ status: 403, description: 'Forbidden from cancelling another customer booking' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CancelBookingDto,
    @Query('userId') userId?: string,
  ): Promise<BookingResponseDto> {
    const customerId = await this.bookingsService.resolveCustomerId(userId);
    return this.bookingsService.cancel(id, customerId, dto);
  }

  /**
   * PATCH /api/v1/bookings/:id/rating
   */
  @Patch(':id/rating')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Rate the driver for a completed booking',
    description: 'Allows the booking customer to submit one 1-to-5-star rating after the trip is completed.',
  })
  @ApiParam({ name: 'id', description: 'Booking UUID' })
  @ApiBody({ type: RateDriverDto })
  @ApiQuery({ name: 'userId', required: false, description: 'Optional Customer UUID for dev testing' })
  @ApiResponse({ status: 200, description: 'Rating saved successfully', type: BookingResponseDto })
  @ApiResponse({ status: 400, description: 'Booking is not completed, has no assigned driver, or is already rated' })
  @ApiResponse({ status: 403, description: 'Forbidden from rating another customer booking' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async rateDriver(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RateDriverDto,
    @Query('userId') userId?: string,
  ): Promise<BookingResponseDto> {
    const customerId = await this.bookingsService.resolveCustomerId(userId);
    return this.bookingsService.rateDriver(id, customerId, dto.rating);
  }

  /**
   * PATCH /api/v1/bookings/:id/status
   */
  @Patch(':id/status')
  @ApiOperation({
    summary: 'Update booking status (Driver/Admin transition)',
    description: 'Enforces state machine status transitions for driver dispatch and trip lifecycle.',
  })
  @ApiParam({ name: 'id', description: 'Booking UUID' })
  @ApiBody({ type: UpdateBookingStatusDto })
  @ApiResponse({ status: 200, description: 'Status updated successfully', type: BookingResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid state machine transition' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBookingStatusDto,
  ): Promise<BookingResponseDto> {
    return this.bookingsService.updateStatus(id, dto);
  }
}
