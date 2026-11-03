import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  HomeScreenDataDto,
  DurationOptionDto,
  SavedPlaceDto,
  RecentBookingDto,
  TrustFeatureDto,
  UserProfileDto,
  PromoBannerDto,
  ActiveBookingDetailDto,
} from './dto/home-response.dto.js';
import { CreateBookingDto, EstimateFareDto, CreateSavedPlaceDto, UpdateSavedPlaceDto, CancelActiveBookingDto } from './dto/booking.dto.js';

@Injectable()
export class HomeService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly defaultDemoSavedPlaces = [
    { title: 'Home', address: '123, Anna Nagar, Coimbatore' },
    { title: 'Office', address: 'RS Puram, Coimbatore' },
    { title: 'Parents Home', address: 'Saibaba Colony, Coimbatore' },
  ];

  // Master trust features matching design
  private readonly trustFeatures: TrustFeatureDto[] = [
    { id: 'feat-1', title: 'Verified Drivers', icon: 'ShieldCheck' },
    { id: 'feat-2', title: 'Real-time Tracking', icon: 'Car' },
    { id: 'feat-3', title: 'Secure Payments', icon: 'CreditCard' },
    { id: 'feat-4', title: '24/7 Support', icon: 'Headphones' },
  ];

  // Promotional banners for home screen marketing
  private readonly promoBanners: PromoBannerDto[] = [
    {
      id: 'banner-1',
      title: 'Professional Drivers, On Your Time',
      subtitle: 'Safe, reliable and convenient driver service for any duration.',
      highlightText: 'Get 20% OFF',
      couponCode: 'DRIVERX20',
      imageUrl: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=800',
    },
    {
      id: 'banner-2',
      title: 'Outstation Travel Made Stress-Free',
      subtitle: 'Book a full-day or weekly verified chauffeur for weekend getaways.',
      highlightText: 'FLAT ₹500 OFF',
      couponCode: 'WEEKEND500',
      imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800',
    },
  ];

  /**
   * Helper: Ensures default duration packages exist in the database
   */
  private async ensureDefaultDurations() {
    const count = await this.prisma.durationPackage.count();
    if (count >= 5) return;

    const defaultPackages = [
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
      {
        id: '1week',
        label: '1 Week',
        subtitle: 'Long Term',
        hours: 168,
        baseFare: 12999,
        description: 'Dedicated weekly chauffeur service for continuous mobility.',
        iconType: 'calendar',
      },
    ];

    for (const pkg of defaultPackages) {
      await this.prisma.durationPackage.upsert({
        where: { id: pkg.id },
        update: {},
        create: pkg,
      });
    }
  }

  /**
   * Helper: Ensures a default customer exists for smooth initial onboarding/testing
   */
  private async getOrCreateCustomer(userId?: string) {
    if (userId) {
      const existing = await this.prisma.user.findUnique({
        where: { id: userId },
      });
      if (existing) return existing;
    }

    const firstCustomer = await this.prisma.user.findFirst({
      where: { role: 'CUSTOMER' },
      orderBy: { createdAt: 'asc' },
    });

    if (firstCustomer) return firstCustomer;

    // Seed default customer matching design portrait
    return this.prisma.user.create({
      data: {
        fullName: 'Priya Sharma',
        phoneNumber: '+91 98765 43210',
        email: 'priya.sharma@driverx.com',
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250',
        role: 'CUSTOMER',
        city: 'Coimbatore',
        preferredLanguage: 'English',
      },
    });
  }

  private async getOrCreateCustomerByPhone(phoneNumber?: string) {
    const digits = phoneNumber?.replace(/\D/g, '');
    if (!phoneNumber || !digits || digits.length < 10 || digits.length > 15) {
      throw new BadRequestException('A valid account phone number is required.');
    }

    const normalizedPhoneNumber = `+${digits}`;
    const customer = await this.prisma.user.findFirst({
      where: {
        role: 'CUSTOMER',
        phoneNumber: { in: [phoneNumber, normalizedPhoneNumber] },
      },
    });

    if (customer) return customer;

    return this.prisma.user.create({
      data: {
        fullName: 'Customer',
        phoneNumber: normalizedPhoneNumber,
        role: 'CUSTOMER',
      },
    });
  }

  /**
   * Helper: Seeds default driver for trip assignments
   */
  private async ensureDefaultDriver() {
    const existingDriver = await this.prisma.user.findFirst({
      where: { role: 'DRIVER' },
      include: { driverProfile: true },
    });
    if (existingDriver) return existingDriver;

    return this.prisma.user.create({
      data: {
        fullName: 'Suresh Kumar',
        phoneNumber: '+91 98450 12345',
        email: 'suresh.kumar@driverx.com',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250',
        role: 'DRIVER',
        city: 'Coimbatore',
        driverProfile: {
          create: {
            vehicleType: 'SEDAN',
            vehicleNumber: 'TN 38 BK 9021',
            vehicleModel: 'Hyundai Verna (White)',
            rating: 4.9,
            totalRides: 148,
            isAvailable: true,
          },
        },
      },
      include: { driverProfile: true },
    });
  }

  /**
   * Helper: Seeds default completed booking for demo customer if none exists
   */
  private async ensureDefaultRecentBookings(customerId: string) {
    const count = await this.prisma.booking.count({ where: { customerId } });
    if (count > 0) return;

    const driver = await this.ensureDefaultDriver();

    await this.prisma.booking.create({
      data: {
        customerId,
        driverId: driver.id,
        durationId: '2h',
        pickupLocation: '123, Anna Nagar, Coimbatore',
        dropLocation: 'RS Puram, Coimbatore',
        pickupDate: 'Today',
        pickupTime: '10:00 AM',
        timingMode: 'now',
        status: 'COMPLETED',
        fare: 499,
        paymentMethod: 'UPI',
        paymentStatus: 'COMPLETED',
      },
    });
  }

  /**
   * Helper: Format Active Booking Detail DTO
   */
  private formatActiveBooking(booking: any): ActiveBookingDetailDto | null {
    if (!booking) return null;
    return {
      id: booking.id,
      status: booking.status,
      durationId: booking.durationId ?? '1h',
      durationLabel: booking.durationPackage?.label ?? `${booking.durationId ?? 'Hourly'} Package`,
      hours: booking.durationPackage?.hours ?? 1,
      pickupAddress: booking.pickupLocation,
      dropAddress: booking.dropLocation ?? null,
      pickupDate: booking.pickupDate ?? 'Today',
      pickupTime: booking.pickupTime ?? 'Immediate',
      fare: booking.fare,
      etaMinutes: booking.status === 'ACCEPTED' ? 6 : booking.status === 'ARRIVED' ? 0 : 10,
      driver: booking.driver
        ? {
            id: booking.driver.id,
            fullName: booking.driver.fullName,
            phoneNumber: booking.driver.phoneNumber,
            avatarUrl: booking.driver.avatarUrl ?? '',
            vehicleModel: booking.driver.driverProfile?.vehicleModel ?? 'Hyundai Verna (White)',
            vehicleNumber: booking.driver.driverProfile?.vehicleNumber ?? 'TN 38 BK 9021',
            rating: booking.driver.driverProfile?.rating ?? 4.9,
            totalRides: booking.driver.driverProfile?.totalRides ?? 148,
          }
        : null,
      createdAt: booking.createdAt.toISOString(),
    };
  }

  /**
   * GET /api/v1/home
   * Returns aggregated composite payload needed by the Customer Home Screen
   */
  async getHomeScreenData(phoneNumber?: string): Promise<HomeScreenDataDto> {
    await this.ensureDefaultDurations();
    const customer = await this.getOrCreateCustomerByPhone(phoneNumber);
    await this.ensureDefaultRecentBookings(customer.id);

    // Parallel DB queries via Prisma
    const [dbDurations, dbSavedPlaces, dbBookings, activeBookingRecord] = await Promise.all([
      this.prisma.durationPackage.findMany({
        where: { id: { in: ['1h', '2h', '4h', '6h', 'fullday', '1week'] } },
        orderBy: { hours: 'asc' },
      }),
      this.prisma.savedPlace.findMany({
        where: { userId: customer.id },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.booking.findMany({
        where: { customerId: customer.id },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          driver: {
            include: { driverProfile: true },
          },
          durationPackage: true,
        },
      }),
      this.prisma.booking.findFirst({
        where: {
          customerId: customer.id,
          status: {
            in: ['PENDING', 'SEARCHING', 'ACCEPTED', 'ARRIVED', 'IN_PROGRESS'],
          },
        },
        orderBy: { createdAt: 'desc' },
        include: {
          driver: {
            include: { driverProfile: true },
          },
          durationPackage: true,
        },
      }),
    ]);

    const userProfile: UserProfileDto = {
      id: customer.id,
      fullName: customer.fullName,
      phoneNumber: customer.phoneNumber,
      avatarUrl: customer.avatarUrl ?? '',
      hasUnreadNotification: true,
      unreadNotificationCount: 2,
    };

    const durations: DurationOptionDto[] = dbDurations.map((d) => ({
      id: d.id,
      label: d.label,
      subtitle: d.subtitle,
      hours: d.hours,
      baseFare: d.baseFare,
      description: d.description,
      iconType: d.iconType,
    }));

    const savedPlaces: SavedPlaceDto[] = dbSavedPlaces
      .filter((place) => !this.defaultDemoSavedPlaces.some((demoPlace) => demoPlace.title === place.title && demoPlace.address === place.address))
      .map((p) => ({
        id: p.id,
        title: p.title,
        address: p.address,
        type: p.type,
        latitude: p.latitude ?? undefined,
        longitude: p.longitude ?? undefined,
      }));

    const recentBookings: RecentBookingDto[] = dbBookings.map((b) => ({
      id: b.id,
      dateTime: b.createdAt.toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      durationLabel: b.durationPackage?.label ?? `${b.durationId ?? 'Hourly'} Package`,
      status: b.status,
      pickupAddress: b.pickupLocation,
      dropAddress: b.dropLocation ?? 'Round Trip / City Use',
      fare: b.fare,
      driverName: b.driver?.fullName ?? 'Driver Assigned on Dispatch',
      vehicleModel: b.driver?.driverProfile?.vehicleModel ?? 'Chauffeured Vehicle',
    }));

    const activeBooking = this.formatActiveBooking(activeBookingRecord);

    return {
      user: userProfile,
      durations,
      savedPlaces,
      recentBookings,
      trustFeatures: this.trustFeatures,
      banners: this.promoBanners,
      activeBooking,
    };
  }

  /**
   * GET /api/v1/home/durations
   */
  async getDurations(): Promise<DurationOptionDto[]> {
    await this.ensureDefaultDurations();
    const list = await this.prisma.durationPackage.findMany({
      orderBy: { hours: 'asc' },
    });
    return list.map((d) => ({
      id: d.id,
      label: d.label,
      subtitle: d.subtitle,
      hours: d.hours,
      baseFare: d.baseFare,
      description: d.description,
      iconType: d.iconType,
    }));
  }

  /**
   * GET /api/v1/home/banners
   */
  getBanners(): PromoBannerDto[] {
    return this.promoBanners;
  }

  /**
   * GET /api/v1/home/active-booking
   */
  async getActiveBooking(userId?: string): Promise<ActiveBookingDetailDto | null> {
    const customer = await this.getOrCreateCustomer(userId);
    const booking = await this.prisma.booking.findFirst({
      where: {
        customerId: customer.id,
        status: {
          in: ['PENDING', 'SEARCHING', 'ACCEPTED', 'ARRIVED', 'IN_PROGRESS'],
        },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        driver: {
          include: { driverProfile: true },
        },
        durationPackage: true,
      },
    });

    return this.formatActiveBooking(booking);
  }

  /**
   * PATCH /api/v1/home/active-booking/:id/cancel
   */
  async cancelActiveBooking(
    bookingId: string,
    dto: CancelActiveBookingDto,
    userId?: string,
  ): Promise<{ success: boolean; message: string; bookingId: string }> {
    const customer = await this.getOrCreateCustomer(userId);
    const booking = await this.prisma.booking.findFirst({
      where: { id: bookingId, customerId: customer.id },
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID '${bookingId}' not found.`);
    }

    if (booking.status === 'COMPLETED' || booking.status === 'CANCELLED') {
      throw new BadRequestException(`Booking is already ${booking.status.toLowerCase()} and cannot be cancelled.`);
    }

    await this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'CANCELLED',
      },
    });

    return {
      success: true,
      message: 'Booking cancelled successfully.',
      bookingId,
    };
  }

  /**
   * GET /api/v1/home/saved-places
   */
  async getSavedPlaces(phoneNumber?: string): Promise<SavedPlaceDto[]> {
    const customer = await this.getOrCreateCustomerByPhone(phoneNumber);
    const list = await this.prisma.savedPlace.findMany({
      where: { userId: customer.id },
      orderBy: { createdAt: 'asc' },
    });
    return list
      .filter((place) => !this.defaultDemoSavedPlaces.some((demoPlace) => demoPlace.title === place.title && demoPlace.address === place.address))
      .map((p) => ({
        id: p.id,
        title: p.title,
        address: p.address,
        type: p.type,
        latitude: p.latitude ?? undefined,
        longitude: p.longitude ?? undefined,
      }));
  }

  /**
   * POST /api/v1/home/saved-places
   */
  async addSavedPlace(dto: CreateSavedPlaceDto, phoneNumber?: string): Promise<SavedPlaceDto> {
    const customer = await this.getOrCreateCustomerByPhone(phoneNumber);
    const created = await this.prisma.savedPlace.create({
      data: {
        userId: customer.id,
        title: dto.title,
        address: dto.address,
        type: dto.type,
        latitude: dto.latitude,
        longitude: dto.longitude,
      },
    });
    return {
      id: created.id,
      title: created.title,
      address: created.address,
      type: created.type,
      latitude: created.latitude ?? undefined,
      longitude: created.longitude ?? undefined,
    };
  }

  /**
   * PATCH /api/v1/home/saved-places/:id
   */
  async updateSavedPlace(id: string, dto: UpdateSavedPlaceDto, phoneNumber?: string): Promise<SavedPlaceDto> {
    const customer = await this.getOrCreateCustomerByPhone(phoneNumber);
    const existing = await this.prisma.savedPlace.findFirst({
      where: { id, userId: customer.id },
    });
    if (!existing) {
      throw new NotFoundException(`Saved place '${id}' not found for customer.`);
    }

    const updated = await this.prisma.savedPlace.update({
      where: { id },
      data: {
        title: dto.title ?? existing.title,
        address: dto.address ?? existing.address,
        type: dto.type ?? existing.type,
        latitude: dto.latitude !== undefined ? dto.latitude : existing.latitude,
        longitude: dto.longitude !== undefined ? dto.longitude : existing.longitude,
      },
    });

    return {
      id: updated.id,
      title: updated.title,
      address: updated.address,
      type: updated.type,
      latitude: updated.latitude ?? undefined,
      longitude: updated.longitude ?? undefined,
    };
  }

  /**
   * DELETE /api/v1/home/saved-places/:id
   */
  async deleteSavedPlace(id: string, phoneNumber?: string): Promise<{ success: boolean; message: string }> {
    const customer = await this.getOrCreateCustomerByPhone(phoneNumber);
    const existing = await this.prisma.savedPlace.findFirst({
      where: { id, userId: customer.id },
    });
    if (!existing) {
      throw new NotFoundException(`Saved place '${id}' not found for customer.`);
    }

    await this.prisma.savedPlace.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Saved place deleted successfully.',
    };
  }

  /**
   * GET /api/v1/home/recent-bookings
   */
  async getRecentBookings(userId?: string): Promise<RecentBookingDto[]> {
    const customer = await this.getOrCreateCustomer(userId);
    await this.ensureDefaultRecentBookings(customer.id);
    const list = await this.prisma.booking.findMany({
      where: { customerId: customer.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        driver: {
          include: { driverProfile: true },
        },
        durationPackage: true,
      },
    });
    return list.map((b) => ({
      id: b.id,
      dateTime: b.createdAt.toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      durationLabel: b.durationPackage?.label ?? `${b.durationId} Package`,
      status: b.status,
      pickupAddress: b.pickupLocation,
      dropAddress: b.dropLocation ?? 'Round Trip / City Use',
      fare: b.fare,
      driverName: b.driver?.fullName ?? 'Driver Assigned on Dispatch',
      vehicleModel: b.driver?.driverProfile?.vehicleModel ?? 'Chauffeured Vehicle',
    }));
  }

  /**
   * POST /api/v1/home/estimate
   */
  async estimateFare(dto: EstimateFareDto) {
    await this.ensureDefaultDurations();
    const pkg = await this.prisma.durationPackage.findUnique({
      where: { id: dto.durationId },
    });
    if (!pkg) {
      throw new NotFoundException(`Duration package '${dto.durationId}' not found.`);
    }

    const estimatedFare = pkg.baseFare;
    const taxes = Math.round(estimatedFare * 0.05); // 5% GST
    const total = estimatedFare + taxes;

    return {
      durationId: pkg.id,
      durationLabel: pkg.label,
      hours: pkg.hours,
      baseFare: estimatedFare,
      taxes,
      estimatedTotalFare: total,
      currency: 'INR',
      pickupLocation: dto.pickupLocation,
      dropLocation: dto.dropLocation ?? null,
    };
  }

  /**
   * POST /api/v1/home/bookings
   */
  async createBooking(dto: CreateBookingDto, userId?: string) {
    await this.ensureDefaultDurations();
    const customer = await this.getOrCreateCustomer(userId);
    const pkg = await this.prisma.durationPackage.findUnique({
      where: { id: dto.durationId },
    });
    if (!pkg) {
      throw new NotFoundException(`Duration package '${dto.durationId}' not found.`);
    }

    const fare = pkg.baseFare + Math.round(pkg.baseFare * 0.05);

    const booking = await this.prisma.booking.create({
      data: {
        customerId: customer.id,
        durationId: pkg.id,
        pickupLocation: dto.pickupLocation,
        dropLocation: dto.dropLocation,
        pickupDate: dto.pickupDate ?? 'Today',
        pickupTime: dto.pickupTime ?? 'Immediate',
        timingMode: dto.timingMode ?? 'now',
        status: 'PENDING',
        fare,
        paymentMethod: 'UPI',
        paymentStatus: 'PENDING',
      },
      include: { durationPackage: true },
    });

    return {
      success: true,
      message: 'Driver booking request created successfully.',
      booking: {
        id: booking.id,
        status: booking.status,
        durationLabel: booking.durationPackage?.label,
        pickupLocation: booking.pickupLocation,
        dropLocation: booking.dropLocation,
        fare: booking.fare,
        createdAt: booking.createdAt,
      },
    };
  }

  /**
   * PATCH /api/v1/home/notifications/read
   */
  async markNotificationsAsRead(userId?: string): Promise<{ success: boolean; unreadNotificationCount: number }> {
    await this.getOrCreateCustomer(userId);
    return {
      success: true,
      unreadNotificationCount: 0,
    };
  }
}
