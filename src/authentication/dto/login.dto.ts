import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsNotEmpty, MinLength, MaxLength, Matches } from 'class-validator';

export class LogInDto {
	@IsEmail()
	@ApiProperty({
		example: 'test@example.com',
	})
	email: string;

	@IsString()
	@IsNotEmpty()
	@MinLength(8)
	@MaxLength(20)
	@ApiProperty({
		example: 'LongPassword*',
	})
	@Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
		message: 'Password too weak',
	})
	password: string;
}
