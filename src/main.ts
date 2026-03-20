import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './core/error/http-exception.filter';
import { TrimStringsPipe } from './core/validation/trim-strings.pipe';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const nodeEnv = configService.get<string>('NODE_ENV') ?? 'development';
  const configuredApiKey = configService.get<string>('API_KEY');
  const swaggerEnabled =
    (configService.get<string>('ENABLE_SWAGGER') ?? '').toLowerCase() ===
      'true' || nodeEnv !== 'production';
  const corsOrigins = (configService.get<string>('CORS_ORIGINS') ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);

  if (nodeEnv === 'production' && !configuredApiKey) {
    throw new Error('API_KEY must be configured in production');
  }

  app.use(helmet());

  app.enableCors({
    origin: corsOrigins.length > 0 ? corsOrigins : false,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'x-api-key', 'x-request-id'],
  });

  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
    new TrimStringsPipe(),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  if (swaggerEnabled) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Vesta Backend API')
      .setDescription('Real-estate simulations API')
      .setVersion('1.0')
      .addApiKey(
        {
          type: 'apiKey',
          in: 'header',
          name: 'x-api-key',
          description: 'API key used to access simulation endpoints',
        },
        'x-api-key',
      )
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document);
  }

  const port = Number(configService.get<string>('PORT') ?? '3000');

  await app.listen(port);
}

void bootstrap();