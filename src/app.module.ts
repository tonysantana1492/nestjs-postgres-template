import { ClassSerializerInterceptor, MiddlewareConsumer, Module, ValidationPipe } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { validate } from './env.validation';
import { ConfigModule } from '@nestjs/config';
import appConfig, { throttleModuleAsyncOptions } from './config/app.config';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import typeormConfig from './config/typeorm.config';
import { LogsMiddleware } from './middlewares/logs.middleware';
import { AppController } from './app.controller';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { LoggerModule } from './logger/logger.module';

@Module({
	imports: [
		ThrottlerModule.forRootAsync(throttleModuleAsyncOptions),
		ConfigModule.forRoot({
			isGlobal: true,
			cache: true,
			expandVariables: true,
			envFilePath: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
			ignoreEnvFile: process.env.NODE_ENV === 'production',
			validate,
			load: [appConfig, databaseConfig, typeormConfig, jwtConfig],
		}),
		DatabaseModule,
		HealthModule,
		LoggerModule,
	],
	controllers: [AppController],
	providers: [
		{
			provide: APP_GUARD,
			useClass: ThrottlerGuard,
		},
		{
			provide: APP_PIPE,
			useClass: ValidationPipe,
		},
		{
			provide: APP_INTERCEPTOR,
			useClass: ClassSerializerInterceptor,
		},
		// {
		//   provide: APP_FILTER,
		//   useClass: ExceptionsLoggerFilter,
		// },
		// {
		//   provide: APP_INTERCEPTOR,
		//   useClass: ExcludeNullInterceptor,
		// },
	],
})
export class AppModule {
	configure(consumer: MiddlewareConsumer) {
		consumer.apply(LogsMiddleware).forRoutes('*');
	}
}
