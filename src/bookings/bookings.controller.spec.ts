import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { BookingStatus } from '@prisma/client';
import { BookingsController } from './bookings.controller.js';
import { BookingsService } from './bookings.service.js';

describe('BookingsController', () => {
  let controller: BookingsController;
  let service: BookingsService;

  const mockEstimateResponse = {
    durationId: '2h',
    durationLabel: '2 Hours',
    hours: 2,
    baseFare: 499,
    taxes: 25,
    estimatedTotalFare: 524,
    currency: 'INR',
    pickupLocation: '123, Anna Nagar, Coimbatore',
    dropLocation: 'RS Puram, Coimbatore',
  };

  const mockBookingResponse = {
    id: 'b1f7b9e0-82a1-42e5-bc02-9a3d132b145a',
    customerId: 'user-1',
    status: 'PENDING',
    durationId: '2h',
    durationLabel: '2 Hours',
    pickupLocation: '123, Anna Nagar, Coimbatore',
    dropLocation: 'RS Puram, Coimbatore',
    pickupDate: null,
    pickupTime: null,
    timingMode: 'now',
    fare: 524,
    currency: 'INR',
    paymentMethod: 'UPI',
    paymentStatus: 'COMPLETED',
    driverId: null,
    driverName: null,
    createdAt: new Date(),
    completedAt: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookingsController],
      providers: [
        {
          provide: BookingsService,
          useValue: {
            resolveCustomerId: vi.fn().mockResolvedValue('user-1'),
            estimateFare: vi.fn().mockImplementation((dto: any) => {
              if (dto.durationId === '2h') return Promise.resolve(mockEstimateResponse);
              throw new NotFoundException(`Duration package '${dto.durationId}' not found.`);
            }),
            create: vi.fn().mockResolvedValue(mockBookingResponse),
            getRecent: vi.fn().mockResolvedValue([mockBookingResponse]),
            findAll: vi.fn().mockResolvedValue({
              items: [mockBookingResponse],
              total: 1,
              page: 1,
              limit: 10,
              totalPages: 1,
            }),
            findOne: vi.fn().mockImplementation((id: string, userId: string) => {
              if (id === mockBookingResponse.id) return Promise.resolve(mockBookingResponse);
              throw new NotFoundException(`Booking with ID '${id}' not found.`);
            }),
            cancel: vi.fn().mockImplementation((id: string, userId: string, dto: any) => {
              if (id === mockBookingResponse.id) {
                return Promise.resolve({ ...mockBookingResponse, status: 'CANCELLED' });
              }
              throw new NotFoundException(`Booking with ID '${id}' not found.`);
            }),
            updateStatus: vi.fn().mockImplementation((id: string, dto: any) => {
              if (id === mockBookingResponse.id) {
                return Promise.resolve({ ...mockBookingResponse, status: dto.status });
              }
              throw new NotFoundException(`Booking with ID '${id}' not found.`);
            }),
          },
        },
      ],
    }).compile();

    controller = module.get<BookingsController>(BookingsController);
    service = module.get<BookingsService>(BookingsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('estimateFare', () => {
    it('should return authoritative fare breakdown with 5% taxes', async () => {
      const result = await controller.estimateFare({
        durationId: '2h',
        pickupLocation: '123, Anna Nagar, Coimbatore',
        dropLocation: 'RS Puram, Coimbatore',
      });
      expect(result).toBeDefined();
      expect(result.baseFare).toBe(499);
      expect(result.taxes).toBe(25);
      expect(result.estimatedTotalFare).toBe(524);
      expect(result.currency).toBe('INR');
    });

    it('should throw NotFoundException when durationId does not exist', async () => {
      await expect(
        controller.estimateFare({
          durationId: 'invalid-pkg',
          pickupLocation: 'Gandhipuram',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a booking with initial PENDING status and unassigned driver', async () => {
      const result = await controller.create(
        {
          durationId: '2h',
          pickupLocation: '123, Anna Nagar, Coimbatore',
          dropLocation: 'RS Puram, Coimbatore',
          timingMode: 'now',
          paymentMethod: 'UPI',
        },
        'user-1',
      );
      expect(result).toBeDefined();
      expect(result.status).toBe('PENDING');
      expect(result.paymentStatus).toBe('COMPLETED');
      expect(result.driverId).toBeNull();
      expect(result.fare).toBe(524);
    });
  });

  describe('getRecent', () => {
    it('should return recent customer bookings', async () => {
      const result = await controller.getRecent('user-1');
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);
      expect(result[0].id).toBe(mockBookingResponse.id);
    });
  });

  describe('findAll', () => {
    it('should return paginated trip history', async () => {
      const result = await controller.findAll({ page: 1, limit: 10 }, 'user-1');
      expect(result.items).toBeDefined();
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return single booking details', async () => {
      const result = await controller.findOne(mockBookingResponse.id, 'user-1');
      expect(result).toBeDefined();
      expect(result.id).toBe(mockBookingResponse.id);
    });

    it('should throw NotFoundException when booking not found', async () => {
      await expect(controller.findOne('non-existent-uuid', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('cancel', () => {
    it('should cancel a booking and return updated status', async () => {
      const result = await controller.cancel(
        mockBookingResponse.id,
        { reason: 'Customer requested cancellation' },
        'user-1',
      );
      expect(result.status).toBe('CANCELLED');
    });
  });

  describe('updateStatus', () => {
    it('should update booking status following state machine transition', async () => {
      const result = await controller.updateStatus(mockBookingResponse.id, {
        status: BookingStatus.ACCEPTED,
      });
      expect(result.status).toBe('ACCEPTED');
    });
  });
});
