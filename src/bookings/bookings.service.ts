import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { BookingStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { EstimateFareDto } from './dto/estimate-fare.dto.js';
import { CreateBookingDto } from './dto/create-booking.dto.js';
import { FareEstimateResponseDto } from './dto/fare-estimate-response.dto.js';
import { BookingResponseDto } from './dto/booking-response.dto.js';
import { CancelBookingDto } from './dto/cancel-booking.dto.js';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto.js';
import { QueryBookingsDto } from './dto/query-bookings.dto.js';
import { PaginatedBookingsResponseDto } from './dto/paginated-bookings-response.dto.js';

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * State Machine: Allowed booking status transitions
   */
  private readonly validTransitions: Record<BookingStatus, BookingStatus[]> = {
    [BookingStatus.PENDING]: [BookingStatus.SEARCHING, BookingStatus.ACCEPTED, BookingStatus.CANCELLED],
    [BookingStatus.SEARCHING]: [BookingStatus.ACCEPTED, BookingStatus.PENDING, BookingStatus.CANCELLED],
    [BookingStatus.ACCEPTED]: [BookingStatus.ARRIVED, BookingStatus.CANCELLED],
    [BookingStatus.ARRIVED]: [BookingStatus.IN_PROGRESS, BookingStatus.CANCELLED],
    [BookingStatus.IN_PROGRESS]: [BookingStatus.COMPLETED, BookingStatus.CANCELLED],
    [BookingStatus.COMPLETED]: [],
    [BookingStatus.CANCELLED]: [],
  };

  /**
   * Helper: Maps Prisma booking record to BookingResponseDto
   */
  private mapToResponseDto(booking: any): BookingResponseDto {
    return {
      id: booking.id,
      customerId: booking.customerId,
      status: booking.status,
      durationId: booking.durationId ?? booking.durationPackage?.id ?? 'custom',
      durationLabel: booking.durationPackage?.label ?? `${booking.durationId ?? 'Hourly'} Package`,
      pickupLocation: booking.pickupLocation,
      dropLocation: booking.dropLocation,
      pickupDate: booking.pickupDate,
      pickupTime: booking.pickupTime,
      timingMode: booking.timingMode,
      fare: booking.fare,
      currency: 'INR',
      paymentMethod: booking.paymentMethod,
      paymentStatus: booking.paymentStatus,
      driverId: booking.driverId,
      driverName: booking.driver?.fullName ?? null,
      createdAt: booking.createdAt,
      completedAt: booking.completedAt,
    };
  }

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
      },
    });

    return created.id;
  }

  /**
   * POST /api/v1/bookings/estimate
   * Authoritative fare estimation based on duration package pricing and GST
   */
  async estimateFare(dto: EstimateFareDto): Promise<FareEstimateResponseDto> {
    const pkg = await this.prisma.durationPackage.findUnique({
      where: { id: dto.durationId },
    });

    if (!pkg) {
      throw new NotFoundException(`Duration package '${dto.durationId}' is not supported or inactive.`);
    }

    const baseFare = pkg.baseFare;
    const taxes = Math.round(baseFare * 0.05); // 5% GST
    const estimatedTotalFare = baseFare + taxes;

    return {
      durationId: pkg.id,
      durationLabel: pkg.label,
      hours: pkg.hours,
      baseFare,
      taxes,
      estimatedTotalFare,
      currency: 'INR',
      pickupLocation: dto.pickupLocation.trim(),
      dropLocation: dto.dropLocation?.trim() || null,
    };
  }

  /**
   * POST /api/v1/bookings
   * Creates a paid driver hire booking request in PostgreSQL with initial PENDING dispatch state
   */
  async create(dto: CreateBookingDto, userId: string): Promise<BookingResponseDto> {
    const pkg = await this.prisma.durationPackage.findUnique({
      where: { id: dto.durationId },
    });

    if (!pkg) {
      throw new NotFoundException(`Duration package '${dto.durationId}' is not supported or inactive.`);
    }

    // Advance scheduling validation
    if (dto.timingMode === 'later' && (!dto.pickupDate || !dto.pickupTime)) {
      throw new BadRequestException('Advance scheduled bookings require both pickupDate and pickupTime.');
    }

    // Authoritative fare calculation
    const baseFare = pkg.baseFare;
    const taxes = Math.round(baseFare * 0.05);
    const totalFare = baseFare + taxes;

    const booking = await this.prisma.booking.create({
      data: {
        customerId: userId,
        durationId: pkg.id,
        pickupLocation: dto.pickupLocation.trim(),
        dropLocation: dto.dropLocation?.trim() || null,
        timingMode: dto.timingMode ?? 'now',
        pickupDate: dto.pickupDate?.trim() || null,
        pickupTime: dto.pickupTime?.trim() || null,
        status: BookingStatus.PENDING,
        fare: totalFare,
        paymentMethod: dto.paymentMethod ?? 'UPI',
        paymentStatus: 'COMPLETED',
      },
      include: {
        durationPackage: true,
        driver: true,
      },
    });

    return this.mapToResponseDto(booking);
  }

  /**
   * GET /api/v1/bookings/recent
   * Retrieves latest 5 bookings scoped to the customer for the home screen card
   */
  async getRecent(userId: string): Promise<BookingResponseDto[]> {
    const bookings = await this.prisma.booking.findMany({
      where: { customerId: userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        durationPackage: true,
        driver: true,
      },
    });

    return bookings.map((b) => this.mapToResponseDto(b));
  }

  /**
   * GET /api/v1/bookings
   * Retrieves paginated trip history for customer with optional status filtering
   */
  async findAll(query: QueryBookingsDto, userId: string): Promise<PaginatedBookingsResponseDto> {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(50, Math.max(1, query.limit || 10));
    const skip = (page - 1) * limit;

    const where: Prisma.BookingWhereInput = {
      customerId: userId,
      ...(query.status ? { status: query.status } : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          durationPackage: true,
          driver: true,
        },
      }),
      this.prisma.booking.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      items: items.map((b) => this.mapToResponseDto(b)),
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * GET /api/v1/bookings/:id
   * Retrieves single booking details by UUID
   */
  async findOne(id: string, userId: string): Promise<BookingResponseDto> {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        durationPackage: true,
        driver: true,
      },
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID '${id}' not found.`);
    }

    // Ensure customer owns the booking
    if (booking.customerId !== userId) {
      throw new ForbiddenException('You do not have permission to view this booking.');
    }

    return this.mapToResponseDto(booking);
  }

  /**
   * PATCH /api/v1/bookings/:id/cancel
   * Customer cancellation with state machine enforcement
   */
  async cancel(id: string, userId: string, dto: CancelBookingDto): Promise<BookingResponseDto> {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        durationPackage: true,
        driver: true,
      },
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID '${id}' not found.`);
    }

    if (booking.customerId !== userId) {
      throw new ForbiddenException('You do not have permission to cancel this booking.');
    }

    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException('Booking is already cancelled.');
    }

    if (booking.status === BookingStatus.COMPLETED) {
      throw new BadRequestException('Completed bookings cannot be cancelled.');
    }

    const updated = await this.prisma.booking.update({
      where: { id },
      data: {
        status: BookingStatus.CANCELLED,
      },
      include: {
        durationPackage: true,
        driver: true,
      },
    });

    return this.mapToResponseDto(updated);
  }

  /**
   * PATCH /api/v1/bookings/:id/status
   * Administrative or driver status transition with state machine validation
   */
  async updateStatus(id: string, dto: UpdateBookingStatusDto): Promise<BookingResponseDto> {
    const current = await this.prisma.booking.findUnique({
      where: { id },
    });

    if (!current) {
      throw new NotFoundException(`Booking with ID '${id}' not found.`);
    }

    const allowed = this.validTransitions[current.status];
    if (!allowed || !allowed.includes(dto.status)) {
      throw new BadRequestException(
        `Invalid status transition from '${current.status}' to '${dto.status}'. Allowed transitions: [${(allowed || []).join(', ')}]`,
      );
    }

    // Atomic transaction for transition & driver counter updates
    const updated = await this.prisma.$transaction(async (tx) => {
      const dataToUpdate: Prisma.BookingUpdateInput = {
        status: dto.status,
      };

      if (dto.driverId) {
        dataToUpdate.driver = { connect: { id: dto.driverId } };
      }

      if (dto.status === BookingStatus.COMPLETED) {
        dataToUpdate.completedAt = new Date();
        dataToUpdate.paymentStatus = 'COMPLETED';

        // Increment driver totalRides if driver is assigned
        const driverId = dto.driverId || current.driverId;
        if (driverId) {
          await tx.driverProfile.updateMany({
            where: { userId: driverId },
            data: { totalRides: { increment: 1 } },
          });
        }
      }

      return tx.booking.update({
        where: { id },
        data: dataToUpdate,
        include: {
          durationPackage: true,
          driver: true,
        },
      });
    });

    return this.mapToResponseDto(updated);
  }
}
