import { Controller, Post, Res, Req, Body, UnauthorizedException, HttpCode } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { UsersService } from '../../features/users/users.service';
import { AuthenticationService } from '../authentication.service';
import { TwoFactorAuthenticationCodeDto } from './dto/two-factor-authentication-code.dto';
import { TwoFactorAuthenticationService } from './two-factor-authentication.service';
import { RequestWithUser } from '../interfaces/request-with-user.interface';
import { AuthRoles } from 'src/authorization/decorators/role.decorator';

@Controller('2fa')
@ApiTags('authentication-2fa')
@AuthRoles()
@ApiBearerAuth()
export class TwoFactorAuthenticationController {
	constructor(
		private readonly twoFactorAuthenticationService: TwoFactorAuthenticationService,
		private readonly usersService: UsersService,
		private readonly authenticationService: AuthenticationService,
	) {}

	@Post('generate')
	async register(@Res() response: Response, @Req() request: RequestWithUser) {
		console.log(request.user);

		const { otpauthUrl } = await this.twoFactorAuthenticationService.generateTwoFactorAuthenticationSecret(
			request.user,
		);

		response.setHeader('content-type', 'image/png');

		return this.twoFactorAuthenticationService.pipeQrCodeStream(response, otpauthUrl);
	}

	@Post('turn-on')
	@HttpCode(200)
	async turnOnTwoFactorAuthentication(
		@Req() request: RequestWithUser,
		@Body() { twoFactorAuthenticationCode }: TwoFactorAuthenticationCodeDto,
	) {
		const isCodeValid = this.twoFactorAuthenticationService.isTwoFactorAuthenticationCodeValid(
			twoFactorAuthenticationCode,
			request.user,
		);
		if (!isCodeValid) {
			throw new UnauthorizedException('Wrong authentication code');
		}
		await this.usersService.turnOnTwoFactorAuthentication(request.user.id);
	}

	@Post('turn-off')
	@HttpCode(200)
	async turnOffTwoFactorAuthentication(
		@Req() request: RequestWithUser,
		@Body() { twoFactorAuthenticationCode }: TwoFactorAuthenticationCodeDto,
	) {
		const isCodeValid = this.twoFactorAuthenticationService.isTwoFactorAuthenticationCodeValid(
			twoFactorAuthenticationCode,
			request.user,
		);
		if (!isCodeValid) {
			throw new UnauthorizedException('Wrong authentication code');
		}
		await this.usersService.turnOffTwoFactorAuthentication(request.user.id);
	}

	@Post('authenticate')
	@HttpCode(200)
	async authenticate(
		@Req() request: RequestWithUser,
		@Body() { twoFactorAuthenticationCode }: TwoFactorAuthenticationCodeDto,
	) {
		const isCodeValid = this.twoFactorAuthenticationService.isTwoFactorAuthenticationCodeValid(
			twoFactorAuthenticationCode,
			request.user,
		);
		if (!isCodeValid) {
			throw new UnauthorizedException('Wrong authentication code');
		}

		const accessTokenCookie = this.authenticationService.getCookieWithJwtAccessToken(request.user.id, true);

		request.res.setHeader('Set-Cookie', [accessTokenCookie]);

		return request.user;
	}
}
