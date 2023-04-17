import { ConfigModule, ConfigService, registerAs } from '@nestjs/config';
import { TypeOrmModuleAsyncOptions, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DatabaseLogger } from '../database/database-logger';
import { Log } from 'src/logger/entities/log.entity';
import { User } from 'src/features/users/entities/user.entity';
import { Address } from 'src/features/users/entities/address.entity';
import { join } from 'path';

class TypeOrmConfig {
	static getOrmConfig(configService: ConfigService): TypeOrmModuleOptions {
		const options: TypeOrmModuleOptions = {
			type: 'postgres',
			host: configService.get('database.host'),
			port: configService.get('database.port'),
			username: configService.get('database.username'),
			password: configService.get('database.password'),
			database: configService.get('database.name'),
			entities: [Log, User, Address],
			synchronize: configService.get('typeorm.synchronize'),
		};

		const isLogging = configService.get('typeorm.logging') || false;
		if (!isLogging) {
			return options;
		}

		return {
			...options,
			logger: new DatabaseLogger(),
		};
	}
}

export const typeormModuleOptions: TypeOrmModuleAsyncOptions = {
	imports: [ConfigModule],
	inject: [ConfigService],
	useFactory: async (configService: ConfigService): Promise<TypeOrmModuleOptions> =>
		TypeOrmConfig.getOrmConfig(configService),
};

export default registerAs('typeorm', () => ({
	synchronize: process.env.TYPEORM_SYNCHRONIZE === 'false' ? false : true,
	logging: process.env.TYPEORM_LOGGING === 'true' ? true : false,
}));
