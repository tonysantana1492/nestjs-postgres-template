import { Module } from '@nestjs/common';
import { UsersModule } from 'src/features/users/users.module';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { EmailConfirmationModule } from 'src/features/email-confirmation/email-confirmation.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { TwoFactorAuthenticationController } from './two-factor/two-factor-authentication.controller';
import { JwtRefreshTokenStrategy } from './strategies/jwt-refresh-token.strategy';
import { TwoFactorAuthenticationService } from './two-factor/two-factor-authentication.service';
import { JwtTwoFactorStrategy } from './two-factor/jwt-two-factor.strategy';

@Module({
	imports: [
		UsersModule,
		PassportModule,
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
		EmailConfirmationModule,
	],
	controllers: [AuthenticationController, TwoFactorAuthenticationController],
	providers: [
		AuthenticationService,
		LocalStrategy,
		JwtStrategy,
		JwtRefreshTokenStrategy,
		TwoFactorAuthenticationService,
		JwtTwoFactorStrategy,
	],
	exports: [AuthenticationService],
})
export class AuthenticationModule {}
