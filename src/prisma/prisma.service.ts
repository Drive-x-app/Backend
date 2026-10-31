import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Database connected successfully via Prisma');
    } catch (err: any) {
      this.logger.warn(
        `Database connection could not be established (${err.message || 'Server offline'}). Ensure PostgreSQL is running at localhost:5432.`,
      );
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
