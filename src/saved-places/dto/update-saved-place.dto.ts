import { IsString, IsOptional, IsNumber, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSavedPlaceDto {
  @ApiPropertyOptional({ example: 'Parents Home (New House)' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ example: '12, New Colony, Saibaba Colony, Coimbatore' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ example: 'parents', enum: ['home', 'office', 'parents', 'other'] })
  @IsString()
  @IsOptional()
  @IsIn(['home', 'office', 'parents', 'other'])
  type?: 'home' | 'office' | 'parents' | 'other';

  @ApiPropertyOptional({ example: 11.0295 })
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @ApiPropertyOptional({ example: 76.9462 })
  @IsNumber()
  @IsOptional()
  longitude?: number;
}
