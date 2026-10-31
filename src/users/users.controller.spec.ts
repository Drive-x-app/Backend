import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { UsersController, NotificationsController } from './users.controller.js';
import { UsersService } from './users.service.js';

describe('UsersController & NotificationsController', () => {
  let usersController: UsersController;
  let notificationsController: NotificationsController;
  let service: UsersService;

  const mockProfile = {
    id: 'c1f7b9e0-82a1-42e5-bc02-9a3d132b145a',
    fullName: 'Priya Sharma',
    phoneNumber: '+91 98765 43210',
    email: 'priya.sharma@driverx.com',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250',
    role: 'CUSTOMER',
    city: 'Coimbatore',
    preferredLanguage: 'English',
    hasUnreadNotification: true,
    unreadNotificationCount: 2,
    createdAt: new Date(),
  };

  const mockNotifications = {
    unreadCount: 2,
    items: [
      {
        id: 'notif-1',
        title: 'Welcome to DriverX',
        message: 'Hire professional, verified chauffeured drivers on-demand by the hour.',
        isRead: false,
        createdAt: new Date().toISOString(),
      },
    ],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController, NotificationsController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            resolveCustomerId: vi.fn().mockResolvedValue('user-1'),
            getProfile: vi.fn().mockImplementation((id: string) => {
              if (id === 'user-1') return Promise.resolve(mockProfile);
              throw new NotFoundException(`User with ID '${id}' not found.`);
            }),
            updateProfile: vi.fn().mockImplementation((id: string, dto: any) => {
              if (id === 'user-1') return Promise.resolve({ ...mockProfile, ...dto });
              throw new NotFoundException(`User with ID '${id}' not found.`);
            }),
            getNotifications: vi.fn().mockResolvedValue(mockNotifications),
          },
        },
      ],
    }).compile();

    usersController = module.get<UsersController>(UsersController);
    notificationsController = module.get<NotificationsController>(NotificationsController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(usersController).toBeDefined();
    expect(notificationsController).toBeDefined();
  });

  describe('UsersController.getProfile', () => {
    it('should return authenticated user profile', async () => {
      const result = await usersController.getProfile('user-1');
      expect(result).toBeDefined();
      expect(result.fullName).toBe('Priya Sharma');
      expect(result.unreadNotificationCount).toBe(2);
    });
  });

  describe('UsersController.updateProfile', () => {
    it('should update and return updated user profile', async () => {
      const result = await usersController.updateProfile(
        { fullName: 'Priya S.', city: 'Chennai' },
        'user-1',
      );
      expect(result).toBeDefined();
      expect(result.fullName).toBe('Priya S.');
      expect(result.city).toBe('Chennai');
    });
  });

  describe('NotificationsController.getNotifications', () => {
    it('should return notifications summary with unread count', async () => {
      const result = await notificationsController.getNotifications('user-1');
      expect(result).toBeDefined();
      expect(result.unreadCount).toBe(2);
      expect(result.items.length).toBe(1);
    });
  });
});
