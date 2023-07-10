import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { TokenPayload } from '../interfaces/token-payload.interface';
import { UsersService } from 'src/features/users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(private readonly configService: ConfigService, private readonly userService: UsersService) {
		super({
			// jwtFromRequest: ExtractJwt.fromExtractors([
			// 	(request: Request) => {
			// 		return request?.cookies?.Authentication;
			// 	},
			// ]),
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: configService.get('jwt.accessTokenSecret'),
		});
	}

	// the return value is inserted into the request object
	async validate(payload: TokenPayload) {
		return this.userService.getById(payload.userId);
	}
}
