import { ApiProperty } from '@nestjs/swagger';

export class NotificationItemDto {
  @ApiProperty({ example: 'notif-1' })
  id: string;

  @ApiProperty({ example: 'Booking Confirmed' })
  title: string;

  @ApiProperty({ example: 'Your chauffeured driver booking has been created.' })
  message: string;

  @ApiProperty({ example: false })
  isRead: boolean;

  @ApiProperty({ example: '2026-10-27T10:00:00.000Z' })
  createdAt: string;
}

export class NotificationSummaryResponseDto {
  @ApiProperty({ example: 2 })
  unreadCount: number;

  @ApiProperty({ type: [NotificationItemDto] })
  items: NotificationItemDto[];
}
