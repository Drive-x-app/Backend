import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { HomeModule } from './home/home.module.js';
import { SavedPlacesModule } from './saved-places/saved-places.module.js';
import { BookingOptionsModule } from './booking-options/booking-options.module.js';
import { BookingsModule } from './bookings/bookings.module.js';
import { UsersModule } from './users/users.module.js';

@Module({
  imports: [PrismaModule, HomeModule, SavedPlacesModule, BookingOptionsModule, BookingsModule, UsersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

