import { ApiProperty } from '@nestjs/swagger';

export class DurationOptionResponseDto {
  @ApiProperty({ example: '1h', description: 'Stable unique duration package identifier' })
  id: string;

  @ApiProperty({ example: '1 Hour', description: 'Display title for UI pills and cards' })
  label: string;

  @ApiProperty({ example: 'Quick Rides', description: 'Subtitle highlighting the use-case' })
  subtitle: string;

  @ApiProperty({ example: 1, description: 'Duration in hours' })
  hours: number;

  @ApiProperty({ example: 60, description: 'Duration in minutes' })
  durationMinutes: number;

  @ApiProperty({ example: 299, description: 'Base fare in Indian Rupees (INR)' })
  baseFare: number;

  @ApiProperty({ example: 'INR', description: 'Currency code' })
  currency: string;

  @ApiProperty({
    example: 'Quick rides and urgent local travel within city limits.',
    description: 'Detailed package description',
  })
  description: string;

  @ApiProperty({ example: 'clock', enum: ['clock', 'sun', 'calendar'] })
  iconType: string;

  @ApiProperty({ example: true, description: 'Whether the package is currently available for booking' })
  isAvailable: boolean;
}
