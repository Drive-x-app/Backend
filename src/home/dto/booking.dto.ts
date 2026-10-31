import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export { EstimateFareDto } from '../../bookings/dto/estimate-fare.dto.js';
export { CreateBookingDto } from '../../bookings/dto/create-booking.dto.js';

export class CancelActiveBookingDto {
  @ApiPropertyOptional({ example: 'Customer change of plans' })
  @IsString()
  @IsOptional()
  reason?: string;
}

export { CreateSavedPlaceDto } from '../../saved-places/dto/create-saved-place.dto.js';
export { UpdateSavedPlaceDto } from '../../saved-places/dto/update-saved-place.dto.js';
