import { BadRequestException } from '@nestjs/common';
import { BookingStatus } from '@prisma/client';
import { describe, expect, it, vi } from 'vitest';
import { PrismaService } from '../prisma/prisma.service.js';
import { BookingsService } from './bookings.service.js';

const completedBooking = {
  id: 'booking-1',
  customerId: 'customer-1',
  driverId: 'driver-1',
  driverRating: null as number | null,
  status: BookingStatus.COMPLETED as BookingStatus,
  durationId: '2h',
  durationPackage: { id: '2h', label: '2 Hours' },
  pickupLocation: 'Pickup',
  dropLocation: 'Dropoff',
  pickupDate: null,
  pickupTime: null,
  timingMode: 'now',
  fare: 500,
  paymentMethod: 'UPI',
  paymentStatus: 'COMPLETED',
  driver: { fullName: 'Driver', driverProfile: { rating: 4.5, totalRatings: 2 } },
  createdAt: new Date(),
  completedAt: new Date(),
};

function createService(booking = completedBooking) {
  let currentBooking = booking;
  let currentProfile = { rating: 4.5, totalRatings: 2 };
  const transaction = {
    booking: {
      findUnique: vi.fn().mockImplementation(() =>
        Promise.resolve({
          ...currentBooking,
          driver: { ...currentBooking.driver, driverProfile: currentProfile },
        }),
      ),
      update: vi.fn().mockImplementation(({ data }) => {
        currentBooking = { ...currentBooking, ...data };
        return Promise.resolve(currentBooking);
      }),
    },
    driverProfile: {
      findUnique: vi.fn().mockResolvedValue(currentProfile),
      update: vi.fn().mockImplementation(({ data }) => {
        currentProfile = {
          rating: data.rating,
          totalRatings: currentProfile.totalRatings + data.totalRatings.increment,
        };
        return Promise.resolve(currentProfile);
      }),
    },
  };
  const prisma = {
    $transaction: vi.fn((callback: (tx: typeof transaction) => Promise<unknown>) =>
      callback(transaction),
    ),
  } as unknown as PrismaService;

  return { service: new BookingsService(prisma), transaction };
}

describe('BookingsService rateDriver', () => {
  it('saves the trip rating and updates the driver average', async () => {
    const { service, transaction } = createService();

    const result = await service.rateDriver('booking-1', 'customer-1', 5);

    expect(transaction.booking.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { driverRating: 5 } }),
    );
    expect(transaction.driverProfile.update).toHaveBeenCalledWith({
      where: { userId: 'driver-1' },
      data: { rating: (4.5 * 2 + 5) / 3, totalRatings: { increment: 1 } },
    });
    expect(result.driverRating).toBe(5);
  });

  it('rejects a rating for a trip that is not completed', async () => {
    const { service } = createService({
      ...completedBooking,
      status: BookingStatus.IN_PROGRESS,
    });

    await expect(service.rateDriver('booking-1', 'customer-1', 4)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('rejects a second rating for the same trip', async () => {
    const { service } = createService({ ...completedBooking, driverRating: 4 });

    await expect(service.rateDriver('booking-1', 'customer-1', 5)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});
