import { Module } from '@nestjs/common';
import { BookingOptionsController } from './booking-options.controller.js';
import { BookingOptionsService } from './booking-options.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [BookingOptionsController],
  providers: [BookingOptionsService],
  exports: [BookingOptionsService],
})
export class BookingOptionsModule {}
