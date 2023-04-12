import { ConfigModule, ConfigService, registerAs } from '@nestjs/config';
import { ThrottlerAsyncOptions } from '@nestjs/throttler';

export const throttleModuleAsyncOptions: ThrottlerAsyncOptions = {
	imports: [ConfigModule],
	inject: [ConfigService],
	useFactory: (configService: ConfigService) => ({
		ttl: configService.get('app.throttle.ttl'),
		limit: configService.get('app.throttle.limit'),
	}),
};

export default registerAs('app', () => ({
	port: parseInt(process.env.PORT, 10) || 3000,

	url: process.env.APP_URL || 'localhost',

	// API Environment: development | production | staging
	env: process.env.NODE_ENV || 'development',

	// API debug mode is enable or not: true | false
	debugMode: process.env.APP_DEBUG === 'false' ? false : true,

	// API support email address
	supportEmail: process.env.SUPPORT_EMAIL || 'support@localhost',

	throttle: {
		ttl: process.env.THROTTLE_TTL || 60,
		limit: process.env.THROTTLE_LIMIT || 10000,
	},

	fileDestination: process.env.UPLOADED_FILES_DESTINATION || './uploadedFiles',

	// two factor authentication app name
	twoFactorAuthAppName: process.env.TWO_FACTOR_AUTHENTICATION_APP_NAME,

	// sites that are CORS enabled
	frontendURL: process.env.FRONTEND_URL,
}));
