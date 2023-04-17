import { ConfigModule, ConfigService, registerAs } from '@nestjs/config';

import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { MailerAsyncOptions } from '@nestjs-modules/mailer/dist/interfaces/mailer-async-options.interface';

export const emailModuleAsyncOptions: MailerAsyncOptions = {
	imports: [ConfigModule],
	inject: [ConfigService],
	useFactory: (configService: ConfigService) => ({
		// transport: 'smtps://user@domain.com:pass@smtp.domain.com',
		host: configService.get('email.host'),
		port: configService.get('email.port'),
		secure: configService.get('email.secure'),
		auth: {
			user: configService.get('email.user'),
			pass: configService.get('email.password'),
		},
		from: configService.get('email.from'),
		template: {
			dir: __dirname + '/templates/',
			adapter: new HandlebarsAdapter(),
			options: {
				strict: true,
			},
		},
	}),
};

export const emailModuleAsyncOptionsLocal: MailerAsyncOptions = {
	imports: [ConfigModule],
	inject: [ConfigService],
	useFactory: (configService: ConfigService) => ({
		transport: {
			host: configService.get('email.host'),
			port: configService.get('email.port'),
			secure: configService.get('email.secure'),
			auth: {
				user: configService.get('email.user'),
				pass: configService.get('email.password'),
			},
		},
		defaults: {
			from: '"No Reply" <no-reply@localhost>',
		},
		preview: true,
		template: {
			dir: process.cwd() + '/templates/',
			adapter: new HandlebarsAdapter(),
			options: {
				strict: true,
			},
		},
	}),
};

export default registerAs('email', () => ({
	host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
	port: process.env.EMAIL_PORT || 2525,
	secure: process.env.EMAIL_IS_SECURE === 'true' ? true : false,
	user: process.env.EMAIL_USER || 'user',
	password: process.env.EMAIL_PASSWORD || 'password',
	from: process.env.EMAIL_FROM || '',
	confirmationLink: process.env.EMAIL_CONFIRMATION_URL || process.env.APP_URL,
}));
