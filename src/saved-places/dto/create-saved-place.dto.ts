import { IsString, IsNotEmpty, IsOptional, IsNumber, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSavedPlaceDto {
  @ApiProperty({ example: 'Parents Home', description: 'Friendly name or label for the location' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Saibaba Colony, Coimbatore', description: 'Full physical address' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({
    example: 'parents',
    enum: ['home', 'office', 'parents', 'other'],
    description: 'Category type for icon styling and categorization',
  })
  @IsString()
  @IsIn(['home', 'office', 'parents', 'other'])
  type: 'home' | 'office' | 'parents' | 'other';

  @ApiPropertyOptional({ example: 11.0289, description: 'GPS Latitude' })
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @ApiPropertyOptional({ example: 76.9456, description: 'GPS Longitude' })
  @IsNumber()
  @IsOptional()
  longitude?: number;
}
