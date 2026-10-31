import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Global routing prefix: /api
  app.setGlobalPrefix('api');

  // URI Versioning: /api/v1/...
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  // Swagger OpenAPI Documentation Setup
  const config = new DocumentBuilder()
    .setTitle('DriverX Platform API')
    .setDescription(
      'REST API documentation for DriverX on-demand chauffeured driver booking platform (Mobile & Web Admin)',
    )
    .setVersion('1.0')
    .addTag('Home', 'Customer Home Screen aggregated endpoints and booking essentials')
    .addTag('Bookings', 'Driver booking creation, estimation, and trip tracking')
    .addTag('Saved Places', 'Customer saved location management')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = process.env.PORT ?? 4000;
  await app.listen(port);
  console.log(`DriverX Backend is running on: http://localhost:${port}/api/v1`);
  console.log(`Swagger OpenAPI Documentation: http://localhost:${port}/api/docs`);
}
await bootstrap();
