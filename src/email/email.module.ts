import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { emailModuleAsyncOptionsLocal } from '../config/email.config';

@Module({
	imports: [MailerModule.forRootAsync(emailModuleAsyncOptionsLocal)],
	providers: [EmailService],
	exports: [EmailService],
})
export class EmailModule {}
