import { Logger, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import { CustomLogger } from './logger/custom-logger';

async function bootstrap() {
	const app = await NestFactory.create(AppModule, {
		bufferLogs: true,
	});

	const configService = app.get(ConfigService);
	const prefix = '/api';
	const version = '1';

	app.use(helmet());

	app.useLogger(app.get(CustomLogger));

	app.setGlobalPrefix(prefix);

	app.enableVersioning({
		type: VersioningType.URI,
		defaultVersion: version,
	});

	app.use(cookieParser());

	app.enableCors({
		origin: configService.get('app.frontendURL'),
		credentials: true,
	});

	const config = new DocumentBuilder()
		.setTitle('NestJS Starter Template')
		.setDescription('This is a starter template where everything is set up.')
		.setVersion('1.0')
		.build();

	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup('swagger/v1', app, document);

	await app.listen(configService.get('app.port'));

	const logger = new Logger('Application');
	const url = configService.get('app.url');
	const port = configService.get('app.port');

	logger.debug(`Application is running on ${url}:${port}${prefix}/v${version}`);
}

bootstrap();
