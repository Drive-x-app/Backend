import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateSavedPlaceDto } from './dto/create-saved-place.dto.js';
import { UpdateSavedPlaceDto } from './dto/update-saved-place.dto.js';
import { SavedPlaceResponseDto } from './dto/saved-place-response.dto.js';

@Injectable()
export class SavedPlacesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Helper: Resolves authenticated customer or dev fallback
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

    // Create default customer if database was freshly initialized
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
   * GET /api/v1/saved-places
   * Retrieves all saved places belonging strictly to the authenticated customer
   */
  async findAll(userId: string): Promise<SavedPlaceResponseDto[]> {
    return this.prisma.savedPlace.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * GET /api/v1/saved-places/:id
   * Retrieves a single saved place ensuring ownership
   */
  async findOne(id: string, userId: string): Promise<SavedPlaceResponseDto> {
    const place = await this.prisma.savedPlace.findFirst({
      where: { id, userId },
    });

    if (!place) {
      throw new NotFoundException(`Saved place '${id}' not found.`);
    }

    return place;
  }

  /**
   * POST /api/v1/saved-places
   * Creates a new saved place associated with the customer
   */
  async create(dto: CreateSavedPlaceDto, userId: string): Promise<SavedPlaceResponseDto> {
    return this.prisma.savedPlace.create({
      data: {
        userId,
        title: dto.title.trim(),
        address: dto.address.trim(),
        type: dto.type,
        latitude: dto.latitude,
        longitude: dto.longitude,
      },
    });
  }

  /**
   * PATCH /api/v1/saved-places/:id
   * Updates an existing saved place with ownership enforcement
   */
  async update(id: string, dto: UpdateSavedPlaceDto, userId: string): Promise<SavedPlaceResponseDto> {
    // Ownership check throws NotFoundException if place doesn't belong to customer
    await this.findOne(id, userId);

    return this.prisma.savedPlace.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title.trim() }),
        ...(dto.address !== undefined && { address: dto.address.trim() }),
        ...(dto.type !== undefined && { type: dto.type }),
        ...(dto.latitude !== undefined && { latitude: dto.latitude }),
        ...(dto.longitude !== undefined && { longitude: dto.longitude }),
      },
    });
  }

  /**
   * DELETE /api/v1/saved-places/:id
   * Deletes a saved place strictly verifying ownership
   */
  async remove(id: string, userId: string): Promise<{ success: boolean; message: string }> {
    // Ownership check
    await this.findOne(id, userId);

    await this.prisma.savedPlace.delete({
      where: { id },
    });

    return {
      success: true,
      message: `Saved place '${id}' has been removed successfully.`,
    };
  }
}
