import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EstimateFareDto {
  @ApiProperty({ example: '2h', description: 'Duration package ID (1h, 2h, 4h, 6h, fullday)' })
  @IsString()
  @IsNotEmpty()
  durationId: string;

  @ApiProperty({ example: '123, Anna Nagar, Coimbatore', description: 'Customer pickup location' })
  @IsString()
  @IsNotEmpty()
  pickupLocation: string;

  @ApiPropertyOptional({ example: 'RS Puram, Coimbatore', description: 'Optional drop location' })
  @IsString()
  @IsOptional()
  dropLocation?: string;
}
