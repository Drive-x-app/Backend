import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBody, ApiParam } from '@nestjs/swagger';
import { HomeService } from './home.service.js';
import {
  CreateBookingDto,
  EstimateFareDto,
  CreateSavedPlaceDto,
  UpdateSavedPlaceDto,
  CancelActiveBookingDto,
} from './dto/booking.dto.js';
import {
  HomeScreenDataDto,
  DurationOptionDto,
  SavedPlaceDto,
  RecentBookingDto,
  PromoBannerDto,
  ActiveBookingDetailDto,
} from './dto/home-response.dto.js';

@ApiTags('Home')
@Controller('home')
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  /**
   * GET /api/v1/home
   * Returns all aggregate data for the home page (user, durations, saved places, recent bookings, features, banners, active booking)
   */
  @Get()
  @ApiOperation({
    summary: 'Get Customer Home Screen composite data',
    description:
      'Fetches customer profile, available booking durations, saved locations, recent trip history, active booking, banners, and service trust badges.',
  })
  @ApiQuery({ name: 'userId', required: false, description: 'Optional Customer UUID' })
  @ApiResponse({ status: 200, description: 'Composite home payload', type: HomeScreenDataDto })
  async getHomeScreenData(@Query('userId') userId?: string): Promise<HomeScreenDataDto> {
    return this.homeService.getHomeScreenData(userId);
  }

  /**
   * GET /api/v1/home/durations
   * Returns the list of available driver duration options
   */
  @Get('durations')
  @ApiOperation({
    summary: 'Get available driver booking duration packages',
    description: 'Lists all available driver hire durations (1h, 2h, 4h, 6h, Full Day, 1 Week) with base pricing.',
  })
  @ApiResponse({ status: 200, description: 'List of duration packages', type: [DurationOptionDto] })
  async getDurations(): Promise<DurationOptionDto[]> {
    return this.homeService.getDurations();
  }

  /**
   * GET /api/v1/home/banners
   * Returns promotional banners for the home screen
   */
  @Get('banners')
  @ApiOperation({
    summary: 'Get Home Screen promotional banners',
    description: 'Retrieves active marketing coupons, discount banners, and promotional cards for customer display.',
  })
  @ApiResponse({ status: 200, description: 'List of promotional banners', type: [PromoBannerDto] })
  getBanners(): PromoBannerDto[] {
    return this.homeService.getBanners();
  }

  /**
   * GET /api/v1/home/active-booking
   * Returns the currently active ongoing or searching driver booking
   */
  @Get('active-booking')
  @ApiOperation({
    summary: 'Get currently active booking',
    description: 'Fetches active booking details, driver assignment, vehicle info, and ETA for the home screen card.',
  })
  @ApiQuery({ name: 'userId', required: false, description: 'Optional Customer UUID' })
  @ApiResponse({ status: 200, description: 'Active booking detail or null', type: ActiveBookingDetailDto })
  async getActiveBooking(@Query('userId') userId?: string): Promise<ActiveBookingDetailDto | null> {
    return this.homeService.getActiveBooking(userId);
  }

  /**
   * PATCH /api/v1/home/active-booking/:id/cancel
   * Cancels an active booking from the home screen
   */
  @Patch('active-booking/:id/cancel')
  @ApiOperation({
    summary: 'Cancel an active booking',
    description: 'Allows customer to cancel an active booking before driver arrival.',
  })
  @ApiParam({ name: 'id', description: 'Booking UUID' })
  @ApiBody({ type: CancelActiveBookingDto })
  @ApiQuery({ name: 'userId', required: false })
  @ApiResponse({ status: 200, description: 'Booking cancelled successfully' })
  @ApiResponse({ status: 400, description: 'Booking cannot be cancelled' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async cancelActiveBooking(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CancelActiveBookingDto,
    @Query('userId') userId?: string,
  ) {
    return this.homeService.cancelActiveBooking(id, dto, userId);
  }

  /**
   * GET /api/v1/home/saved-places
   * Returns saved places for the customer
   */
  @Get('saved-places')
  @ApiOperation({
    summary: "Get customer's saved places",
    description: 'Fetches saved favorite locations (Home, Office, Parents Home) for one-tap pickup/drop selection.',
  })
  @ApiQuery({ name: 'userId', required: false })
  @ApiResponse({ status: 200, description: 'Customer saved places list', type: [SavedPlaceDto] })
  async getSavedPlaces(@Query('userId') userId?: string): Promise<SavedPlaceDto[]> {
    return this.homeService.getSavedPlaces(userId);
  }

  /**
   * POST /api/v1/home/saved-places
   * Saves a new place for quick selection
   */
  @Post('saved-places')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Save a new favorite location',
    description: 'Allows a customer to save an address with label and coordinates.',
  })
  @ApiBody({ type: CreateSavedPlaceDto })
  @ApiResponse({ status: 201, description: 'Created saved place record', type: SavedPlaceDto })
  async addSavedPlace(
    @Body() dto: CreateSavedPlaceDto,
    @Query('userId') userId?: string,
  ): Promise<SavedPlaceDto> {
    return this.homeService.addSavedPlace(dto, userId);
  }

  /**
   * PATCH /api/v1/home/saved-places/:id
   * Updates an existing saved location
   */
  @Patch('saved-places/:id')
  @ApiOperation({
    summary: 'Update an existing saved place',
    description: 'Updates title, address, or coordinates of an existing favorite location.',
  })
  @ApiParam({ name: 'id', description: 'Saved Place UUID' })
  @ApiBody({ type: UpdateSavedPlaceDto })
  @ApiQuery({ name: 'userId', required: false })
  @ApiResponse({ status: 200, description: 'Updated saved place record', type: SavedPlaceDto })
  @ApiResponse({ status: 404, description: 'Saved place not found' })
  async updateSavedPlace(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSavedPlaceDto,
    @Query('userId') userId?: string,
  ): Promise<SavedPlaceDto> {
    return this.homeService.updateSavedPlace(id, dto, userId);
  }

  /**
   * DELETE /api/v1/home/saved-places/:id
   * Removes a saved favorite location
   */
  @Delete('saved-places/:id')
  @ApiOperation({
    summary: 'Delete a saved place',
    description: 'Removes a favorite address from the customer account.',
  })
  @ApiParam({ name: 'id', description: 'Saved Place UUID' })
  @ApiQuery({ name: 'userId', required: false })
  @ApiResponse({ status: 200, description: 'Saved place removed successfully' })
  @ApiResponse({ status: 404, description: 'Saved place not found' })
  async deleteSavedPlace(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('userId') userId?: string,
  ) {
    return this.homeService.deleteSavedPlace(id, userId);
  }

  /**
   * GET /api/v1/home/recent-bookings
   * Returns recent trips & bookings
   */
  @Get('recent-bookings')
  @ApiOperation({
    summary: 'Get recent trips',
    description: 'Returns past completed, pending, or in-progress bookings for the home-screen card.',
  })
  @ApiQuery({ name: 'userId', required: false })
  @ApiResponse({ status: 200, description: 'List of recent bookings', type: [RecentBookingDto] })
  async getRecentBookings(@Query('userId') userId?: string): Promise<RecentBookingDto[]> {
    return this.homeService.getRecentBookings(userId);
  }

  /**
   * POST /api/v1/home/estimate
   * Calculates estimated fare for chosen duration & route
   */
  @Post('estimate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Calculate fare estimate',
    description: 'Calculates base fare, applicable taxes, and total fare based on the selected duration.',
  })
  @ApiBody({ type: EstimateFareDto })
  @ApiResponse({ status: 200, description: 'Fare calculation breakdown' })
  async estimateFare(@Body() dto: EstimateFareDto) {
    return this.homeService.estimateFare(dto);
  }

  /**
   * POST /api/v1/home/bookings
   * Creates a new booking request for a driver
   */
  @Post('bookings')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Book a Driver',
    description: 'Creates a driver hire request in PENDING state ready for driver assignment.',
  })
  @ApiBody({ type: CreateBookingDto })
  @ApiResponse({ status: 201, description: 'Booking request created successfully' })
  async createBooking(@Body() dto: CreateBookingDto, @Query('userId') userId?: string) {
    return this.homeService.createBooking(dto, userId);
  }

  /**
   * PATCH /api/v1/home/notifications/read
   * Marks home screen notifications as read
   */
  @Patch('notifications/read')
  @ApiOperation({
    summary: 'Mark notifications as read',
    description: 'Acknowledges customer notifications and clears unread counter badge.',
  })
  @ApiQuery({ name: 'userId', required: false })
  @ApiResponse({ status: 200, description: 'Notifications marked as read' })
  async markNotificationsAsRead(@Query('userId') userId?: string) {
    return this.homeService.markNotificationsAsRead(userId);
  }
}
