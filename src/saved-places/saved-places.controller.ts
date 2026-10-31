import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { SavedPlacesService } from './saved-places.service.js';
import { CreateSavedPlaceDto } from './dto/create-saved-place.dto.js';
import { UpdateSavedPlaceDto } from './dto/update-saved-place.dto.js';
import { SavedPlaceResponseDto } from './dto/saved-place-response.dto.js';

@ApiTags('Saved Places')
@Controller('saved-places')
export class SavedPlacesController {
  constructor(private readonly savedPlacesService: SavedPlacesService) {}

  /**
   * GET /api/v1/saved-places
   */
  @Get()
  @ApiOperation({
    summary: "List all authenticated customer's saved places",
    description: 'Retrieves all saved addresses (Home, Office, Parents Home) for the customer.',
  })
  @ApiQuery({ name: 'userId', required: false, description: 'Optional Customer UUID for dev testing' })
  @ApiResponse({ status: 200, description: 'List of saved places', type: [SavedPlaceResponseDto] })
  async findAll(@Query('userId') userId?: string): Promise<SavedPlaceResponseDto[]> {
    const customerId = await this.savedPlacesService.resolveCustomerId(userId);
    return this.savedPlacesService.findAll(customerId);
  }

  /**
   * GET /api/v1/saved-places/:id
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get single saved place by ID',
    description: 'Returns a specific saved place verifying customer ownership.',
  })
  @ApiParam({ name: 'id', description: 'Saved Place UUID', format: 'uuid' })
  @ApiQuery({ name: 'userId', required: false })
  @ApiResponse({ status: 200, description: 'Saved place detail', type: SavedPlaceResponseDto })
  @ApiResponse({ status: 404, description: 'Place not found or unauthorized' })
  async findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query('userId') userId?: string,
  ): Promise<SavedPlaceResponseDto> {
    const customerId = await this.savedPlacesService.resolveCustomerId(userId);
    return this.savedPlacesService.findOne(id, customerId);
  }

  /**
   * POST /api/v1/saved-places
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new saved place',
    description: 'Adds a favorite location for one-tap pickup/drop selection.',
  })
  @ApiBody({ type: CreateSavedPlaceDto })
  @ApiQuery({ name: 'userId', required: false })
  @ApiResponse({ status: 201, description: 'Place created successfully', type: SavedPlaceResponseDto })
  async create(
    @Body() dto: CreateSavedPlaceDto,
    @Query('userId') userId?: string,
  ): Promise<SavedPlaceResponseDto> {
    const customerId = await this.savedPlacesService.resolveCustomerId(userId);
    return this.savedPlacesService.create(dto, customerId);
  }

  /**
   * PATCH /api/v1/saved-places/:id
   */
  @Patch(':id')
  @ApiOperation({
    summary: 'Update an existing saved place',
    description: 'Partially updates title, address, coordinates, or category.',
  })
  @ApiParam({ name: 'id', description: 'Saved Place UUID', format: 'uuid' })
  @ApiBody({ type: UpdateSavedPlaceDto })
  @ApiQuery({ name: 'userId', required: false })
  @ApiResponse({ status: 200, description: 'Updated place record', type: SavedPlaceResponseDto })
  @ApiResponse({ status: 404, description: 'Place not found or unauthorized' })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateSavedPlaceDto,
    @Query('userId') userId?: string,
  ): Promise<SavedPlaceResponseDto> {
    const customerId = await this.savedPlacesService.resolveCustomerId(userId);
    return this.savedPlacesService.update(id, dto, customerId);
  }

  /**
   * DELETE /api/v1/saved-places/:id
   */
  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a saved place',
    description: 'Permanently removes a saved place strictly verifying customer ownership.',
  })
  @ApiParam({ name: 'id', description: 'Saved Place UUID', format: 'uuid' })
  @ApiQuery({ name: 'userId', required: false })
  @ApiResponse({ status: 200, description: 'Place removed successfully' })
  @ApiResponse({ status: 404, description: 'Place not found or unauthorized' })
  async remove(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query('userId') userId?: string,
  ): Promise<{ success: boolean; message: string }> {
    const customerId = await this.savedPlacesService.resolveCustomerId(userId);
    return this.savedPlacesService.remove(id, customerId);
  }
}
