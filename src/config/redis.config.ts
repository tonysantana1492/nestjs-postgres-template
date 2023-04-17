import { CacheModuleAsyncOptions } from '@nestjs/common/cache/interfaces/cache-module.interface';
import { ConfigModule, ConfigService, registerAs } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-store';

export const cacheModuleAsyncOptions: CacheModuleAsyncOptions = {
	imports: [ConfigModule],
	inject: [ConfigService],
	isGlobal: true,
	useFactory: async (configService: ConfigService) => ({
		store: await redisStore({
			url: configService.get('redis.url'),
			ttl: configService.get('redis.ttl'),
		}),
	}),
};

export default registerAs('redis', () => ({
	url: `${process.env.REDIS_HOST}:${process.env.REDIS_PORT}` || 'redis://localhost:6379',
	host: process.env.REDIS_HOST,
	port: process.env.REDIS_PORT,
	ttl: process.env.REDIS_TTL || 125,
}));
