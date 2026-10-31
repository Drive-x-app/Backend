import { Module } from '@nestjs/common';
import { UsersController, NotificationsController } from './users.controller.js';
import { UsersService } from './users.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [UsersController, NotificationsController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
