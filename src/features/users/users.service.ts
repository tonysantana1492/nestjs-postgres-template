import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UserNotFoundException } from './exceptions/user-not-found.exception';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
	constructor(@InjectRepository(User) private usersRepository: Repository<User>) {}

	public async setCurrentRefreshToken(refreshToken: string, userId: number) {
		const currentHashedRefreshToken = await bcrypt.hash(refreshToken, 10);

		await this.usersRepository.update(userId, {
			currentHashedRefreshToken,
		});
	}

	public getAllUsers(): Promise<User[]> {
		return this.usersRepository.find();
	}

	public async create(createUserDto: CreateUserDto): Promise<User> {
		const newUser = this.usersRepository.create(createUserDto);
		await this.usersRepository.save(newUser);
		return newUser;
	}

	public async getById(id: number): Promise<User> {
		const user = await this.usersRepository.findOne({
			where: {
				id,
			},
		});

		if (!user) {
			throw new UserNotFoundException(id);
		}

		return user;
	}

	public async getByEmail(email: string): Promise<User> {
		const user = await this.usersRepository.findOne({
			where: {
				email,
			},
		});

		if (!user) {
			throw new HttpException('User with this email does not exist', HttpStatus.NOT_FOUND);
		}

		return user;
	}

	async markEmailAsConfirmed(email: string): Promise<UpdateResult> {
		return this.usersRepository.update(
			{ email },
			{
				isEmailConfirmed: true,
			},
		);
	}

	async getUserIfRefreshTokenMatches(refreshToken: string, userId: number): Promise<User> {
		const user = await this.getById(userId);
		const isRefreshTokenMatching = await bcrypt.compare(refreshToken, user.currentHashedRefreshToken);
		if (isRefreshTokenMatching) {
			return user;
		}
	}

	public async removeRefreshToken(userId: number): Promise<UpdateResult> {
		return this.usersRepository.update(userId, {
			currentHashedRefreshToken: null,
		});
	}
}
