import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// import { Request } from 'express';
import { UsersService } from '../../features/users/users.service';
import { TokenPayload } from '../interfaces/token-payload.interface';

@Injectable()
export class JwtTwoFactorStrategy extends PassportStrategy(Strategy, 'jwt-two-factor') {
	constructor(private readonly configService: ConfigService, private readonly userService: UsersService) {
		super({
			// jwtFromRequest: ExtractJwt.fromExtractors([
			// 	(request: Request) => {
			// 		return request?.cookies?.Authentication;
			// 	},
			// ]),
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: configService.get('jwt.accessTokenSecret'),
			ignoreExpiration: false,
		});
	}

	async validate(payload: TokenPayload) {
		const user = await this.userService.getById(payload.userId);
		if (!user.isTwoFactorAuthenticationEnabled) {
			return user;
		}
		if (payload.isSecondFactorAuthenticated) {
			return user;
		}
	}
}
