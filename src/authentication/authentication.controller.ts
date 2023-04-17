import { Body, Controller, Get, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { AuthenticationService } from './authentication.service';
import { RegisterDto } from './dto/register.dto';
import { User } from 'src/features/users/entities/user.entity';
import { EmailConfirmationService } from 'src/features/email-confirmation/email-confirmation.service';
import { UsersService } from 'src/features/users/users.service';
import { RequestWithUser } from './request-with-user.interface';
import { LogInDto } from './dto/login.dto';
import { LocalAuthenticationGuard } from './local-authentication.guard';
import { JwtAuthenticationGuard } from './jwt-authentication.guard';
import { JwtRefreshGuard } from './jwt-refresh.guard';

@Controller('authentication')
@ApiTags('authentication')
export class AuthenticationController {
	constructor(
		private readonly authenticationService: AuthenticationService,
		private readonly usersService: UsersService,
		private readonly emailConfirmationService: EmailConfirmationService,
	) {}

	@UseGuards(JwtAuthenticationGuard)
	@Get()
	authenticate(@Req() request: RequestWithUser) {
		const user = request.user;
		return user;
	}

	@UseGuards(JwtRefreshGuard)
	@Get('refresh')
	refresh(@Req() request: RequestWithUser) {
		const accessTokenCookie = this.authenticationService.getCookieWithJwtAccessToken(request.user.id);

		request.res.setHeader('Set-Cookie', accessTokenCookie);
		return request.user;
	}

	@Post('register')
	async register(@Body() registrationData: RegisterDto): Promise<User> {
		const user = await this.authenticationService.register(registrationData);
		await this.emailConfirmationService.sendVerificationLink(registrationData);
		return user;
	}

	@HttpCode(204)
	@Post('send-email')
	async sendEmail(@Body() registrationData: RegisterDto): Promise<any> {
		await this.emailConfirmationService.sendVerificationLink(registrationData);
		return;
	}

	@HttpCode(200)
	@Get('redis')
	redis() {
		return 'mmmmmmm';
	}

	@HttpCode(200)
	@UseGuards(LocalAuthenticationGuard)
	@Post('login')
	@ApiBody({ type: LogInDto })
	async login(@Req() request: RequestWithUser) {
		const { user } = request;
		const accessTokenCookie = this.authenticationService.getCookieWithJwtAccessToken(user.id);

		const { cookie: refreshTokenCookie, token: refreshToken } =
			this.authenticationService.getCookieWithJwtRefreshToken(user.id);

		await this.usersService.setCurrentRefreshToken(refreshToken, user.id);

		request.res.setHeader('Set-Cookie', [accessTokenCookie, refreshTokenCookie]);

		if (user.isTwoFactorAuthenticationEnabled) {
			return;
		}

		return user;
	}

	@UseGuards(JwtAuthenticationGuard)
	@Post('logout')
	@HttpCode(200)
	async logOut(@Req() request: RequestWithUser) {
		await this.usersService.removeRefreshToken(request.user.id);
		request.res.setHeader('Set-Cookie', this.authenticationService.getCookiesForLogOut());
	}
}
