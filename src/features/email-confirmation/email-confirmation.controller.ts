import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { EmailConfirmationService } from './email-confirmation.service';
import { ConfirmEmailDto } from './dto/confirm-email.dto';
import { RequestWithUser } from 'src/authentication/request-with-user.interface';
import { JwtAuthenticationGuard } from 'src/authentication/jwt-authentication.guard';

@Controller('email-confirmation')
@ApiTags('authentication')
export class EmailConfirmationController {
	constructor(private readonly emailConfirmationService: EmailConfirmationService) {}

	@Post('confirm')
	async confirm(@Body() confirmationData: ConfirmEmailDto): Promise<void> {
		const email = await this.emailConfirmationService.decodeConfirmationToken(confirmationData.token);
		await this.emailConfirmationService.confirmEmail(email);
	}

	@Post('resend-confirmation-link')
	@UseGuards(JwtAuthenticationGuard)
	async resendConfirmationLink(@Req() request: RequestWithUser): Promise<void> {
		await this.emailConfirmationService.resendConfirmationLink(request.user.id);
	}
}
