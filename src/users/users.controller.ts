import { Controller, Get, Patch, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBody } from '@nestjs/swagger';
import { UsersService } from './users.service.js';
import { UserProfileResponseDto } from './dto/user-profile-response.dto.js';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto.js';
import { NotificationSummaryResponseDto } from './dto/notification-summary-response.dto.js';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * GET /api/v1/users/me
   */
  @Get('me')
  @ApiOperation({
    summary: 'Get authenticated customer profile',
    description: 'Retrieves current user profile information including unread notification status.',
  })
  @ApiQuery({ name: 'userId', required: false, description: 'Optional Customer UUID for dev testing' })
  @ApiResponse({ status: 200, description: 'Current user profile', type: UserProfileResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getProfile(@Query('userId') userId?: string): Promise<UserProfileResponseDto> {
    const customerId = await this.usersService.resolveCustomerId(userId);
    return this.usersService.getProfile(customerId);
  }

  /**
   * PATCH /api/v1/users/me
   */
  @Patch('me')
  @ApiOperation({
    summary: 'Update customer profile',
    description: 'Updates personal preferences, name, email, language or city for the customer.',
  })
  @ApiBody({ type: UpdateUserProfileDto })
  @ApiQuery({ name: 'userId', required: false, description: 'Optional Customer UUID for dev testing' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully', type: UserProfileResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateProfile(
    @Body() dto: UpdateUserProfileDto,
    @Query('userId') userId?: string,
  ): Promise<UserProfileResponseDto> {
    const customerId = await this.usersService.resolveCustomerId(userId);
    return this.usersService.updateProfile(customerId, dto);
  }

  /**
   * GET /api/v1/users/notifications/summary
   */
  @Get('notifications/summary')
  @ApiOperation({
    summary: 'Get customer notifications summary',
    description: 'Retrieves unread notification count and recent notification alerts for home badge.',
  })
  @ApiQuery({ name: 'userId', required: false, description: 'Optional Customer UUID for dev testing' })
  @ApiResponse({ status: 200, description: 'Notifications summary', type: NotificationSummaryResponseDto })
  async getNotifications(@Query('userId') userId?: string): Promise<NotificationSummaryResponseDto> {
    const customerId = await this.usersService.resolveCustomerId(userId);
    return this.usersService.getNotifications(customerId);
  }
}

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * GET /api/v1/notifications/summary
   */
  @Get('summary')
  @ApiOperation({
    summary: 'Get notifications summary',
    description: 'Retrieves unread notification count and alerts for navigation badges.',
  })
  @ApiQuery({ name: 'userId', required: false, description: 'Optional Customer UUID for dev testing' })
  @ApiResponse({ status: 200, description: 'Notifications summary', type: NotificationSummaryResponseDto })
  async getNotifications(@Query('userId') userId?: string): Promise<NotificationSummaryResponseDto> {
    const customerId = await this.usersService.resolveCustomerId(userId);
    return this.usersService.getNotifications(customerId);
  }
}
