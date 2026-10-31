import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HomeController } from './home.controller.js';
import { HomeService } from './home.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

describe('HomeController', () => {
  let controller: HomeController;
  let homeService: HomeService;

  const mockHomeScreenData = {
    user: {
      id: 'user-1',
      fullName: 'Priya Sharma',
      phoneNumber: '+91 98765 43210',
      avatarUrl: 'https://example.com/avatar.jpg',
      hasUnreadNotification: true,
      unreadNotificationCount: 2,
    },
    durations: [
      {
        id: '1h',
        label: '1 Hour',
        subtitle: 'Quick Rides',
        hours: 1,
        baseFare: 299,
        description: 'Quick rides and urgent local travel within city limits.',
        iconType: 'clock',
      },
      {
        id: '2h',
        label: '2 Hours',
        subtitle: 'Business Trips',
        hours: 2,
        baseFare: 499,
        description: 'Meetings, shopping, clinic visits and personal travel.',
        iconType: 'clock',
      },
      {
        id: '4h',
        label: '4 Hours',
        subtitle: 'City Tours',
        hours: 4,
        baseFare: 899,
        description: 'Multiple stops across the city and half-day errands.',
        iconType: 'clock',
      },
      {
        id: '6h',
        label: '6 Hours',
        subtitle: 'Longer Trips',
        hours: 6,
        baseFare: 1299,
        description: 'Extended business meetings or outstation local excursions.',
        iconType: 'clock',
      },
      {
        id: 'fullday',
        label: 'Full Day',
        subtitle: 'Full Day',
        hours: 12,
        baseFare: 2199,
        description: 'Complete 12-hour chauffeured travel experience.',
        iconType: 'sun',
      },
    ],
    savedPlaces: [
      { id: 'p1', title: 'Home', address: '123, Anna Nagar', type: 'home' },
      { id: 'p2', title: 'Office', address: 'RS Puram', type: 'office' },
    ],
    recentBookings: [],
    trustFeatures: [
      { id: 'feat-1', title: 'Verified Drivers', icon: 'ShieldCheck' },
      { id: 'feat-2', title: 'Real-time Tracking', icon: 'Car' },
      { id: 'feat-3', title: 'Secure Payments', icon: 'CreditCard' },
      { id: 'feat-4', title: '24/7 Support', icon: 'Headphones' },
    ],
    banners: [
      {
        id: 'banner-1',
        title: 'Professional Drivers, On Your Time',
        subtitle: 'Safe, reliable and convenient driver service for any duration.',
        highlightText: 'Get 20% OFF',
        couponCode: 'DRIVERX20',
        imageUrl: 'https://example.com/banner.jpg',
      },
    ],
    activeBooking: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HomeController],
      providers: [
        {
          provide: HomeService,
          useValue: {
            getHomeScreenData: vi.fn().mockResolvedValue(mockHomeScreenData),
            getDurations: vi.fn().mockResolvedValue(mockHomeScreenData.durations),
            getBanners: vi.fn().mockReturnValue(mockHomeScreenData.banners),
            getActiveBooking: vi.fn().mockResolvedValue(null),
            cancelActiveBooking: vi.fn().mockResolvedValue({ success: true, message: 'Booking cancelled successfully.' }),
            getSavedPlaces: vi.fn().mockResolvedValue(mockHomeScreenData.savedPlaces),
            addSavedPlace: vi.fn().mockResolvedValue({ id: 'p3', title: 'Gym', address: 'Race Course', type: 'other' }),
            updateSavedPlace: vi.fn().mockResolvedValue({ id: 'p1', title: 'Home Villa', address: '123, Anna Nagar', type: 'home' }),
            deleteSavedPlace: vi.fn().mockResolvedValue({ success: true, message: 'Saved place deleted successfully.' }),
            getRecentBookings: vi.fn().mockResolvedValue([]),
            estimateFare: vi.fn().mockResolvedValue({ baseFare: 299, taxes: 15, estimatedTotalFare: 314 }),
            createBooking: vi.fn().mockResolvedValue({ success: true, message: 'Driver booking request created successfully.' }),
            markNotificationsAsRead: vi.fn().mockResolvedValue({ success: true, unreadNotificationCount: 0 }),
          },
        },
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<HomeController>(HomeController);
    homeService = module.get<HomeService>(HomeService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getHomeScreenData', () => {
    it('should return aggregated home screen data', async () => {
      const result = await controller.getHomeScreenData('user-1');
      expect(result).toEqual(mockHomeScreenData);
      expect(result.durations).toHaveLength(5);
      expect(result.durations[0].id).toBe('1h');
      expect(result.durations[4].id).toBe('fullday');
      expect(result.user.fullName).toBe('Priya Sharma');
    });
  });

  describe('getDurations', () => {
    it('should return duration packages', async () => {
      const durations = await controller.getDurations();
      expect(durations).toHaveLength(5);
      expect(durations.map((d) => d.id)).toEqual(['1h', '2h', '4h', '6h', 'fullday']);
    });
  });

  describe('getBanners', () => {
    it('should return promotional banners', () => {
      const banners = controller.getBanners();
      expect(banners).toHaveLength(1);
      expect(banners[0].couponCode).toBe('DRIVERX20');
    });
  });

  describe('savedPlaces CRUD', () => {
    it('should create a saved place', async () => {
      const res = await controller.addSavedPlace({ title: 'Gym', address: 'Race Course', type: 'other' });
      expect(res.id).toBe('p3');
    });

    it('should update a saved place', async () => {
      const res = await controller.updateSavedPlace('p1', { title: 'Home Villa' });
      expect(res.title).toBe('Home Villa');
    });

    it('should delete a saved place', async () => {
      const res = await controller.deleteSavedPlace('p1');
      expect(res.success).toBe(true);
    });
  });

  describe('notifications', () => {
    it('should mark notifications as read', async () => {
      const res = await controller.markNotificationsAsRead('user-1');
      expect(res.unreadNotificationCount).toBe(0);
    });
  });
});
