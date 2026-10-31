import { ApiProperty } from '@nestjs/swagger';

export class SavedPlaceResponseDto {
  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  id: string;

  @ApiProperty({ example: 'c1f7b9e0-82a1-42e5-bc02-9a3d132b145a' })
  userId: string;

  @ApiProperty({ example: 'Home' })
  title: string;

  @ApiProperty({ example: '123, Anna Nagar, Coimbatore' })
  address: string;

  @ApiProperty({ example: 'home', enum: ['home', 'office', 'parents', 'other'] })
  type: string;

  @ApiProperty({ example: 11.0168, required: false, nullable: true })
  latitude?: number | null;

  @ApiProperty({ example: 76.9558, required: false, nullable: true })
  longitude?: number | null;

  @ApiProperty({ example: '2026-10-27T10:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-10-27T10:00:00.000Z' })
  updatedAt: Date;
}
