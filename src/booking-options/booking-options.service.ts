import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { DurationOptionResponseDto } from './dto/duration-option-response.dto.js';

@Injectable()
export class BookingOptionsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * GET /api/v1/booking-options/durations
   * Fetches the 5 duration packages shown on the Customer Home Screen
   */
  async getDurations(): Promise<DurationOptionResponseDto[]> {
    const list = await this.prisma.durationPackage.findMany({
      where: {
        id: { in: ['1h', '2h', '4h', '6h', 'fullday'] },
      },
      orderBy: { hours: 'asc' },
    });

    return list.map((pkg) => ({
      id: pkg.id,
      label: pkg.label,
      subtitle: pkg.subtitle,
      hours: pkg.hours,
      durationMinutes: pkg.hours * 60,
      baseFare: pkg.baseFare,
      currency: 'INR',
      description: pkg.description,
      iconType: pkg.iconType,
      isAvailable: true,
    }));
  }

  /**
   * Resolves a single duration package by ID
   */
  async findOne(id: string): Promise<DurationOptionResponseDto> {
    const pkg = await this.prisma.durationPackage.findUnique({
      where: { id },
    });

    if (!pkg) {
      throw new NotFoundException(`Duration option '${id}' is not supported or inactive.`);
    }

    return {
      id: pkg.id,
      label: pkg.label,
      subtitle: pkg.subtitle,
      hours: pkg.hours,
      durationMinutes: pkg.hours * 60,
      baseFare: pkg.baseFare,
      currency: 'INR',
      description: pkg.description,
      iconType: pkg.iconType,
      isAvailable: true,
    };
  }
}
