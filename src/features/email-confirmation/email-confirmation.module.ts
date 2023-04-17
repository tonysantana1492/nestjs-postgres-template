import { Module } from '@nestjs/common';
import { EmailModule } from 'src/email/email.module';
import { JwtModule } from '@nestjs/jwt';
import { EmailConfirmationController } from './email-confirmation.controller';
import { EmailConfirmationService } from './email-confirmation.service';
import { UsersModule } from '../users/users.module';

@Module({
	imports: [EmailModule, JwtModule.register({}), UsersModule],
	controllers: [EmailConfirmationController],
	providers: [EmailConfirmationService],
	exports: [EmailConfirmationService],
})
export class EmailConfirmationModule {}
