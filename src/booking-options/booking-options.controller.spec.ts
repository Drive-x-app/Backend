import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { BookingOptionsController } from './booking-options.controller.js';
import { BookingOptionsService } from './booking-options.service.js';

describe('BookingOptionsController', () => {
  let controller: BookingOptionsController;
  let service: BookingOptionsService;

  const mockDurations = [
    {
      id: '1h',
      label: '1 Hour',
      subtitle: 'Quick Rides',
      hours: 1,
      durationMinutes: 60,
      baseFare: 299,
      currency: 'INR',
      description: 'Quick rides and urgent local travel within city limits.',
      iconType: 'clock',
      isAvailable: true,
    },
    {
      id: '2h',
      label: '2 Hours',
      subtitle: 'Business Trips',
      hours: 2,
      durationMinutes: 120,
      baseFare: 499,
      currency: 'INR',
      description: 'Meetings, shopping, clinic visits and personal travel.',
      iconType: 'clock',
      isAvailable: true,
    },
    {
      id: '4h',
      label: '4 Hours',
      subtitle: 'City Tours',
      hours: 4,
      durationMinutes: 240,
      baseFare: 899,
      currency: 'INR',
      description: 'Multiple stops across the city and half-day errands.',
      iconType: 'clock',
      isAvailable: true,
    },
    {
      id: '6h',
      label: '6 Hours',
      subtitle: 'Longer Trips',
      hours: 6,
      durationMinutes: 360,
      baseFare: 1299,
      currency: 'INR',
      description: 'Extended business meetings or outstation local excursions.',
      iconType: 'clock',
      isAvailable: true,
    },
    {
      id: 'fullday',
      label: 'Full Day',
      subtitle: 'Full Day',
      hours: 12,
      durationMinutes: 720,
      baseFare: 2199,
      currency: 'INR',
      description: 'Complete 12-hour chauffeured travel experience.',
      iconType: 'sun',
      isAvailable: true,
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookingOptionsController],
      providers: [
        {
          provide: BookingOptionsService,
          useValue: {
            getDurations: vi.fn().mockResolvedValue(mockDurations),
            findOne: vi.fn().mockImplementation((id: string) => {
              const found = mockDurations.find((d) => d.id === id);
              if (found) return Promise.resolve(found);
              throw new NotFoundException(`Duration option '${id}' is not supported or inactive.`);
            }),
          },
        },
      ],
    }).compile();

    controller = module.get<BookingOptionsController>(BookingOptionsController);
    service = module.get<BookingOptionsService>(BookingOptionsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getDurations', () => {
    it('should return exactly 5 duration options matching design', async () => {
      const list = await controller.getDurations();
      expect(list).toHaveLength(5);
      expect(list.map((d) => d.id)).toEqual(['1h', '2h', '4h', '6h', 'fullday']);
      expect(list[0].durationMinutes).toBe(60);
      expect(list[4].hours).toBe(12);
      expect(list[4].label).toBe('Full Day');
    });
  });

  describe('findOne', () => {
    it('should return 2h package details', async () => {
      const pkg = await controller.findOne('2h');
      expect(pkg.id).toBe('2h');
      expect(pkg.baseFare).toBe(499);
      expect(pkg.currency).toBe('INR');
    });

    it('should throw NotFoundException for unsupported duration', async () => {
      await expect(controller.findOne('unknown-pkg')).rejects.toThrow(NotFoundException);
    });
  });
});
