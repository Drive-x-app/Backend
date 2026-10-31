import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { UserProfileResponseDto } from './dto/user-profile-response.dto.js';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto.js';
import { NotificationSummaryResponseDto } from './dto/notification-summary-response.dto.js';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Helper: Resolves authenticated customer UUID or dev fallback
   */
  async resolveCustomerId(providedUserId?: string): Promise<string> {
    if (providedUserId) {
      const user = await this.prisma.user.findUnique({ where: { id: providedUserId } });
      if (user) return user.id;
    }

    const firstCustomer = await this.prisma.user.findFirst({
      where: { role: 'CUSTOMER' },
      orderBy: { createdAt: 'asc' },
    });

    if (firstCustomer) return firstCustomer.id;

    const created = await this.prisma.user.create({
      data: {
        fullName: 'Priya Sharma',
        phoneNumber: '+91 98765 43210',
        email: 'priya.sharma@driverx.com',
        role: 'CUSTOMER',
        city: 'Coimbatore',
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250',
      },
    });

    return created.id;
  }

  /**
   * GET /api/v1/users/me
   */
  async getProfile(userId: string): Promise<UserProfileResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID '${userId}' not found.`);
    }

    return {
      id: user.id,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      email: user.email,
      avatarUrl: user.avatarUrl,
      role: user.role,
      city: user.city,
      preferredLanguage: user.preferredLanguage,
      hasUnreadNotification: true,
      unreadNotificationCount: 2,
      createdAt: user.createdAt,
    };
  }

  /**
   * PATCH /api/v1/users/me
   */
  async updateProfile(userId: string, dto: UpdateUserProfileDto): Promise<UserProfileResponseDto> {
    const existing = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existing) {
      throw new NotFoundException(`User with ID '${userId}' not found.`);
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.fullName !== undefined ? { fullName: dto.fullName.trim() } : {}),
        ...(dto.email !== undefined ? { email: dto.email.trim().toLowerCase() } : {}),
        ...(dto.city !== undefined ? { city: dto.city.trim() } : {}),
        ...(dto.preferredLanguage !== undefined ? { preferredLanguage: dto.preferredLanguage.trim() } : {}),
        ...(dto.avatarUrl !== undefined ? { avatarUrl: dto.avatarUrl.trim() } : {}),
      },
    });

    return {
      id: updated.id,
      fullName: updated.fullName,
      phoneNumber: updated.phoneNumber,
      email: updated.email,
      avatarUrl: updated.avatarUrl,
      role: updated.role,
      city: updated.city,
      preferredLanguage: updated.preferredLanguage,
      hasUnreadNotification: true,
      unreadNotificationCount: 2,
      createdAt: updated.createdAt,
    };
  }

  /**
   * GET /api/v1/notifications/summary
   */
  async getNotifications(userId: string): Promise<NotificationSummaryResponseDto> {
    // Standard notifications payload for customer home badge and notification center
    return {
      unreadCount: 2,
      items: [
        {
          id: 'notif-1',
          title: 'Welcome to DriverX',
          message: 'Hire professional, verified chauffeured drivers on-demand by the hour.',
          isRead: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'notif-2',
          title: 'Safety First',
          message: 'All DriverX chauffeurs are background verified and professionally trained.',
          isRead: false,
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
      ],
    };
  }
}
