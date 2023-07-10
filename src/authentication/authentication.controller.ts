import { Body, Controller, Get, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { AuthenticationService } from './authentication.service';
import { RegisterDto } from './dto/register.dto';
import { EmailConfirmationService } from 'src/features/email-confirmation/email-confirmation.service';
import { UsersService } from 'src/features/users/users.service';
import { RequestWithUser } from './interfaces/request-with-user.interface';
import { LogInDto } from './dto/login.dto';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { LocalAuthenticationGuard } from './guards/local-authentication.guard';
import { AuthRoles } from 'src/authorization/decorators/role.decorator';

@Controller('authentication')
@ApiTags('authentication')
export class AuthenticationController {
	constructor(
		private readonly authenticationService: AuthenticationService,
		private readonly usersService: UsersService,
		private readonly emailConfirmationService: EmailConfirmationService,
	) {}

	// TODO: for test propouses
	@HttpCode(204)
	@Post('send-email')
	async sendEmail(@Body() registrationData: RegisterDto): Promise<any> {
		await this.emailConfirmationService.sendVerificationLink(registrationData);
		return;
	}

	@AuthRoles()
	@ApiBearerAuth()
	@Get('')
	authenticate(@Req() request: RequestWithUser) {
		const user = request.user;
		return user;
	}

	@UseGuards(JwtRefreshGuard)
	@ApiBearerAuth()
	@Get('refresh')
	refresh(@Req() request: RequestWithUser) {
		const accessToken = this.authenticationService.getJwtAccessToken(request.user.id);

		return { token: accessToken };
	}

	@Post('register')
	async register(@Body() registrationData: RegisterDto) {
		await this.authenticationService.register(registrationData);
		await this.emailConfirmationService.sendVerificationLink(registrationData);
		return;
	}

	@HttpCode(200)
	@UseGuards(LocalAuthenticationGuard)
	@Post('login')
	@ApiBody({ type: LogInDto })
	async login(@Req() request: RequestWithUser) {
		const { user } = request;

		const accessToken = this.authenticationService.getJwtAccessToken(user.id);

		if (user.isTwoFactorAuthenticationEnabled) {
			return;
		}

		return { token: accessToken };
	}

	@HttpCode(200)
	@AuthRoles()
	@ApiBearerAuth()
	@Post('logout')
	async logOut(@Req() request: RequestWithUser) {
		await this.usersService.removeRefreshToken(request.user.id);
	}
}
