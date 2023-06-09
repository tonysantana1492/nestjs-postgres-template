import {
	CacheInterceptor,
	CacheModule,
	ClassSerializerInterceptor,
	MiddlewareConsumer,
	Module,
	ValidationPipe,
} from '@nestjs/common';
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
import { UsersModule } from './features/users/users.module';
import { EmailModule } from './email/email.module';
import emailConfig from './config/email.config';
import { EmailConfirmationModule } from './features/email-confirmation/email-confirmation.module';
import { AuthenticationModule } from './authentication/authentication.module';
import redisConfig, { cacheModuleAsyncOptions } from './config/redis.config';
import { LocalFilesModule } from './features/local-files/local-files.module';
import { DatabaseFilesModule } from './features/database-files/database-files.module';
import { FilesModule } from './features/files/files.module';
import { AuthorizationModule } from './authorization/authorization.module';
import { RolesGuard } from './authorization/guards/roles.guard';

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
			load: [appConfig, emailConfig, databaseConfig, typeormConfig, jwtConfig, redisConfig],
		}),
		CacheModule.registerAsync(cacheModuleAsyncOptions),
		DatabaseModule,
		HealthModule,
		LoggerModule,
		UsersModule,
		EmailModule,
		EmailConfirmationModule,
		AuthenticationModule,
		AuthorizationModule,
		LocalFilesModule,
		DatabaseFilesModule,
		FilesModule,
	],
	controllers: [AppController],
	providers: [
		{
			provide: APP_GUARD,
			useClass: ThrottlerGuard,
		},
		{
			provide: APP_GUARD,
			useClass: RolesGuard,
		},
		{
			provide: APP_PIPE,
			useClass: ValidationPipe,
		},
		{
			provide: APP_INTERCEPTOR,
			useClass: ClassSerializerInterceptor,
		},
		{
			provide: APP_INTERCEPTOR,
			useClass: CacheInterceptor,
		},
	],
})
export class AppModule {
	configure(consumer: MiddlewareConsumer) {
		consumer.apply(LogsMiddleware).forRoutes('*');
	}
}
