import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
	@IsEmail()
	@ApiProperty({
		example: 'test@example.com',
	})
	email: string;

	@IsString()
	@IsNotEmpty()
	@ApiProperty({
		example: 'John Doe',
	})
	name: string;

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

	@ApiProperty({
		example: '+123123123123',
	})
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	@Matches(/^\+[1-9]\d{1,14}$/)
	phoneNumber?: string;
}
