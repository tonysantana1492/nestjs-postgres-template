import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
	constructor(private readonly configService: ConfigService, private readonly mailerService: MailerService) {}

	public async sendMail(options: ISendMailOptions) {
		try {
			await this.mailerService.sendMail(options);
		} catch (error) {
			throw new InternalServerErrorException(`Internal Mailer Failed Error - ${error.message}`);
		}
	}
}
