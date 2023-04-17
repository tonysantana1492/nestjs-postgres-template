import { Module } from '@nestjs/common';
import { UsersModule } from 'src/features/users/users.module';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { EmailConfirmationModule } from 'src/features/email-confirmation/email-confirmation.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
	imports: [
		UsersModule,
		EmailConfirmationModule,
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: async (ConfigService: ConfigService) => ({
				secret: ConfigService.get('jwt.accessTokenSecret'),
				signOptions: {
					expiresIn: `${ConfigService.get('jwt.accessTokenExpirationTime')}s`,
				},
			}),
		}),
	],
	controllers: [AuthenticationController],
	providers: [AuthenticationService],
	exports: [],
})
export class AuthenticationModule {}
