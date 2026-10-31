import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserProfileResponseDto {
  @ApiProperty({ example: 'c1f7b9e0-82a1-42e5-bc02-9a3d132b145a' })
  id: string;

  @ApiProperty({ example: 'Priya Sharma' })
  fullName: string;

  @ApiProperty({ example: '+91 98765 43210' })
  phoneNumber: string;

  @ApiPropertyOptional({ example: 'priya.sharma@driverx.com', nullable: true })
  email?: string | null;

  @ApiPropertyOptional({
    example: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250',
    nullable: true,
  })
  avatarUrl?: string | null;

  @ApiProperty({ example: 'CUSTOMER', enum: ['CUSTOMER', 'DRIVER', 'ADMIN'] })
  role: string;

  @ApiPropertyOptional({ example: 'Coimbatore', nullable: true })
  city?: string | null;

  @ApiPropertyOptional({ example: 'English', nullable: true })
  preferredLanguage?: string | null;

  @ApiProperty({ example: true })
  hasUnreadNotification: boolean;

  @ApiProperty({ example: 2 })
  unreadNotificationCount: number;

  @ApiProperty({ example: '2026-10-27T10:00:00.000Z' })
  createdAt: Date;
}
