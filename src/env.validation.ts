import { plainToClass } from 'class-transformer';
import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, validateSync } from 'class-validator';

enum Environment {
	Development = 'development',
	Production = 'production',
	Test = 'test',
	Staging = 'staging',
}

class EnvironmentVariables {
	// App
	@IsEnum(Environment)
	@IsNotEmpty()
	NODE_ENV: Environment;

	@IsBoolean()
	@IsNotEmpty()
	APP_DEBUG: boolean;

	@IsString()
	@IsNotEmpty()
	APP_URL: string;

	@IsNumber()
	@IsNotEmpty()
	PORT: number;

	// Database
	@IsString()
	@IsNotEmpty()
	DATABASE_HOST: string;

	@IsNumber()
	@IsNotEmpty()
	DATABASE_PORT: number;

	@IsString()
	@IsNotEmpty()
	DATABASE_USER: string;

	@IsString()
	@IsNotEmpty()
	DATABASE_PASSWORD: string;

	@IsString()
	@IsNotEmpty()
	DATABASE_NAME: string;

	// TypeORM
	@IsBoolean()
	@IsOptional()
	TYPEORM_SYNCHRONIZE: boolean;

	@IsBoolean()
	@IsOptional()
	TYPEORM_LOGGING: boolean;

	// JWT
	@IsString()
	@IsNotEmpty()
	JWT_ACCESS_TOKEN_SECRET: string;

	@IsNumber()
	@IsNotEmpty()
	JWT_ACCESS_TOKEN_EXPIRATION_TIME: number;

	@IsString()
	@IsNotEmpty()
	JWT_REFRESH_TOKEN_SECRET: string;

	@IsNumber()
	@IsNotEmpty()
	JWT_REFRESH_TOKEN_EXPIRATION_TIME: number;

	@IsString()
	@IsNotEmpty()
	JWT_VERIFICATION_TOKEN_SECRET: string;

	@IsNumber()
	@IsNotEmpty()
	JWT_VERIFICATION_TOKEN_EXPIRATION_TIME: number;
}

export function validate(config: Record<string, unknown>) {
	const validatedConfig = plainToClass(EnvironmentVariables, config, {
		enableImplicitConversion: true,
	});
	const errors = validateSync(validatedConfig, {
		skipMissingProperties: false,
	});

	if (errors.length > 0) {
		throw new Error(errors.toString());
	}
	return validatedConfig;
}
