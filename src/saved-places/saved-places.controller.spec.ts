import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { SavedPlacesController } from './saved-places.controller.js';
import { SavedPlacesService } from './saved-places.service.js';

describe('SavedPlacesController', () => {
  let controller: SavedPlacesController;
  let service: SavedPlacesService;

  const mockPlace = {
    id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    userId: 'user-1',
    title: 'Home',
    address: '123, Anna Nagar, Coimbatore',
    type: 'home',
    latitude: 11.0168,
    longitude: 76.9558,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SavedPlacesController],
      providers: [
        {
          provide: SavedPlacesService,
          useValue: {
            resolveCustomerId: vi.fn().mockResolvedValue('user-1'),
            findAll: vi.fn().mockResolvedValue([mockPlace]),
            findOne: vi.fn().mockImplementation((id: string, userId: string) => {
              if (id === mockPlace.id) return Promise.resolve(mockPlace);
              throw new NotFoundException(`Saved place '${id}' not found.`);
            }),
            create: vi.fn().mockResolvedValue(mockPlace),
            update: vi.fn().mockImplementation((id: string, dto: any) =>
              Promise.resolve({ ...mockPlace, ...dto }),
            ),
            remove: vi.fn().mockResolvedValue({ success: true, message: 'Removed' }),
          },
        },
      ],
    }).compile();

    controller = module.get<SavedPlacesController>(SavedPlacesController);
    service = module.get<SavedPlacesService>(SavedPlacesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all saved places for the customer', async () => {
      const places = await controller.findAll('user-1');
      expect(places).toHaveLength(1);
      expect(places[0].title).toBe('Home');
    });
  });

  describe('findOne', () => {
    it('should return a specific place when it belongs to customer', async () => {
      const place = await controller.findOne(mockPlace.id, 'user-1');
      expect(place.id).toBe(mockPlace.id);
      expect(place.title).toBe('Home');
    });

    it('should throw NotFoundException when place does not belong to customer', async () => {
      await expect(
        controller.findOne('00000000-0000-0000-0000-000000000000', 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create and return the new saved place', async () => {
      const result = await controller.create(
        {
          title: 'Office',
          address: 'RS Puram, Coimbatore',
          type: 'office',
        },
        'user-1',
      );
      expect(result).toBeDefined();
      expect(service.create).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update and return the modified place', async () => {
      const updated = await controller.update(
        mockPlace.id,
        { title: 'New Home' },
        'user-1',
      );
      expect(updated.title).toBe('New Home');
    });
  });

  describe('remove', () => {
    it('should delete place and return success', async () => {
      const res = await controller.remove(mockPlace.id, 'user-1');
      expect(res.success).toBe(true);
    });
  });
});
