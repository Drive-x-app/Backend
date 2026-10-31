import { ApiProperty } from '@nestjs/swagger';

export class UserProfileDto {
  @ApiProperty({ example: 'usr_c1f7b9e0' })
  id: string;

  @ApiProperty({ example: 'Hariharan' })
  fullName: string;

  @ApiProperty({ example: '+91 98765 43210' })
  phoneNumber: string;

  @ApiProperty({ example: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150' })
  avatarUrl: string;

  @ApiProperty({ example: true })
  hasUnreadNotification: boolean;

  @ApiProperty({ example: 2 })
  unreadNotificationCount: number;
}

export class DurationOptionDto {
  @ApiProperty({ example: '1h' })
  id: string;

  @ApiProperty({ example: '1 Hour' })
  label: string;

  @ApiProperty({ example: 'Quick Rides' })
  subtitle: string;

  @ApiProperty({ example: 1 })
  hours: number;

  @ApiProperty({ example: 299 })
  baseFare: number;

  @ApiProperty({ example: 'Quick rides and urgent local travel within city limits.' })
  description: string;

  @ApiProperty({ example: 'clock', enum: ['clock', 'sun', 'calendar'] })
  iconType: string;
}

export class SavedPlaceDto {
  @ApiProperty({ example: 'place-home' })
  id: string;

  @ApiProperty({ example: 'Home' })
  title: string;

  @ApiProperty({ example: '123, Anna Nagar, Coimbatore' })
  address: string;

  @ApiProperty({ example: 'home', enum: ['home', 'office', 'parents', 'other'] })
  type: string;

  @ApiProperty({ example: 11.0168, required: false })
  latitude?: number;

  @ApiProperty({ example: 76.9558, required: false })
  longitude?: number;
}

export class RecentBookingDto {
  @ApiProperty({ example: 'bk-1001' })
  id: string;

  @ApiProperty({ example: 'Today, 10:00 AM' })
  dateTime: string;

  @ApiProperty({ example: '2 Hours' })
  durationLabel: string;

  @ApiProperty({ example: 'Completed', enum: ['Completed', 'Pending', 'In Progress', 'Cancelled'] })
  status: string;

  @ApiProperty({ example: '123, Anna Nagar, Coimbatore' })
  pickupAddress: string;

  @ApiProperty({ example: 'RS Puram, Coimbatore' })
  dropAddress: string;

  @ApiProperty({ example: 499 })
  fare: number;

  @ApiProperty({ example: 'Suresh Kumar', required: false })
  driverName?: string;

  @ApiProperty({ example: 'Hyundai Verna (White)', required: false })
  vehicleModel?: string;
}

export class TrustFeatureDto {
  @ApiProperty({ example: 'feat-1' })
  id: string;

  @ApiProperty({ example: 'Verified Drivers' })
  title: string;

  @ApiProperty({ example: 'ShieldCheck' })
  icon: string;
}

export class DriverDetailDto {
  @ApiProperty({ example: 'drv-101' })
  id: string;

  @ApiProperty({ example: 'Suresh Kumar' })
  fullName: string;

  @ApiProperty({ example: '+91 98450 12345' })
  phoneNumber: string;

  @ApiProperty({ example: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250' })
  avatarUrl: string;

  @ApiProperty({ example: 'Hyundai Verna (White)' })
  vehicleModel: string;

  @ApiProperty({ example: 'TN 38 BK 9021' })
  vehicleNumber: string;

  @ApiProperty({ example: 4.9 })
  rating: number;

  @ApiProperty({ example: 148 })
  totalRides: number;
}

export class ActiveBookingDetailDto {
  @ApiProperty({ example: 'bk-1001' })
  id: string;

  @ApiProperty({ example: 'PENDING', enum: ['PENDING', 'SEARCHING', 'ACCEPTED', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] })
  status: string;

  @ApiProperty({ example: '2h' })
  durationId: string;

  @ApiProperty({ example: '2 Hours' })
  durationLabel: string;

  @ApiProperty({ example: 2 })
  hours: number;

  @ApiProperty({ example: '123, Anna Nagar, Coimbatore' })
  pickupAddress: string;

  @ApiProperty({ example: 'RS Puram, Coimbatore', nullable: true })
  dropAddress: string | null;

  @ApiProperty({ example: 'Today' })
  pickupDate: string;

  @ApiProperty({ example: '10:00 AM' })
  pickupTime: string;

  @ApiProperty({ example: 499 })
  fare: number;

  @ApiProperty({ example: 8, required: false })
  etaMinutes?: number;

  @ApiProperty({ type: DriverDetailDto, nullable: true })
  driver: DriverDetailDto | null;

  @ApiProperty({ example: '2026-10-28T04:45:00.000Z' })
  createdAt: string;
}

export class PromoBannerDto {
  @ApiProperty({ example: 'banner-1' })
  id: string;

  @ApiProperty({ example: 'Professional Drivers, On Your Time' })
  title: string;

  @ApiProperty({ example: 'Safe, reliable and convenient driver service for any duration.' })
  subtitle: string;

  @ApiProperty({ example: 'Get 20% OFF' })
  highlightText: string;

  @ApiProperty({ example: 'DRIVERX20' })
  couponCode: string;

  @ApiProperty({ example: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=800' })
  imageUrl: string;
}

export class HomeScreenDataDto {
  @ApiProperty({ type: UserProfileDto })
  user: UserProfileDto;

  @ApiProperty({ type: [DurationOptionDto] })
  durations: DurationOptionDto[];

  @ApiProperty({ type: [SavedPlaceDto] })
  savedPlaces: SavedPlaceDto[];

  @ApiProperty({ type: [RecentBookingDto] })
  recentBookings: RecentBookingDto[];

  @ApiProperty({ type: [TrustFeatureDto] })
  trustFeatures: TrustFeatureDto[];

  @ApiProperty({ type: [PromoBannerDto] })
  banners: PromoBannerDto[];

  @ApiProperty({ type: ActiveBookingDetailDto, nullable: true })
  activeBooking: ActiveBookingDetailDto | null;
}
