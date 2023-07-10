import { HttpException, HttpStatus, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, UpdateResult } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UserNotFoundException } from './exceptions/user-not-found.exception';
import * as bcrypt from 'bcrypt';
import { join } from 'path';
import * as util from 'util';
import * as filesystem from 'fs';
import { LocalFilesService } from '../local-files/local-files.service';
import { LocalFileDto } from '../local-files/dto/local-file.dto';
import { FileNotFoundException } from '../files/exceptions/file-not-found.exception';
import { DatabaseFilesService } from '../database-files/database-files.service';
import { FilesService } from '../files/files.service';

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(User) private usersRepository: Repository<User>,
		private readonly filesService: FilesService,
		private readonly localFilesService: LocalFilesService,
		private readonly databaseFilesService: DatabaseFilesService,
		private dataSource: DataSource,
	) {}

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

	async setTwoFactorAuthenticationSecret(secret: string, userId: number) {
		return this.usersRepository.update(userId, {
			twoFactorAuthenticationSecret: secret,
		});
	}

	async turnOnTwoFactorAuthentication(userId: number) {
		return this.usersRepository.update(userId, {
			isTwoFactorAuthenticationEnabled: true,
		});
	}

	async turnOffTwoFactorAuthentication(userId: number) {
		return this.usersRepository.update(userId, {
			isTwoFactorAuthenticationEnabled: false,
		});
	}

	async getAvatar(userId: number) {
		const user = await this.getById(userId);
		const fileId = user.avatarId;
		if (!fileId) {
			throw new NotFoundException();
		}
		const fileMetadata = await this.localFilesService.getFileById(user.avatarId);

		const pathOnDisk = join(process.cwd(), fileMetadata.path);

		const file = await util.promisify(filesystem.readFile)(pathOnDisk);

		return {
			file,
			fileMetadata,
		};
	}

	// Upload files to file sistem
	async addAvatar(userId: number, fileData: LocalFileDto) {
		const avatar = await this.localFilesService.saveLocalFileData(fileData);

		await this.usersRepository.update(userId, {
			avatarId: avatar.id,
		});
	}

	async deleteAvatar(userId: number) {
		const queryRunner = this.dataSource.createQueryRunner();

		const user = await this.getById(userId);
		const fileId = user.avatarId;
		if (fileId) {
			await queryRunner.connect();
			await queryRunner.startTransaction();

			try {
				await queryRunner.manager.update(User, userId, {
					...user,
					avatarId: null,
				});
				await this.localFilesService.deleteLocalFileWithQueryRunner(fileId, queryRunner);
				await queryRunner.commitTransaction();
			} catch (error) {
				await queryRunner.rollbackTransaction();
				throw new InternalServerErrorException();
			} finally {
				await queryRunner.release();
			}
		} else {
			throw new FileNotFoundException(fileId);
		}
	}

	// Upload files to Postgres database directly
	async addAvatarInPGsql(userId: number, imageBuffer: Buffer, filename: string) {
		const queryRunner = this.dataSource.createQueryRunner();

		await queryRunner.connect();
		await queryRunner.startTransaction();

		try {
			const user = await queryRunner.manager.findOne(User, {
				where: {
					id: userId,
				},
			});
			const currentAvatarId = user.avatarId;
			const avatar = await this.databaseFilesService.uploadDatabaseFileWithQueryRunner(
				imageBuffer,
				filename,
				queryRunner,
			);

			await queryRunner.manager.update(User, userId, {
				avatarId: avatar.id,
			});

			if (currentAvatarId) {
				await this.databaseFilesService.deleteFileWithQueryRunner(currentAvatarId, queryRunner);
			}

			await queryRunner.commitTransaction();
			return avatar;
		} catch {
			await queryRunner.rollbackTransaction();
			throw new InternalServerErrorException();
		} finally {
			await queryRunner.release();
		}
	}

	async getAvatarInPGsql(userId: number) {
		const user = await this.getById(userId);
		const fileId = user.avatarId;
		if (!fileId) {
			throw new NotFoundException();
		}
		const { data, id, filename } = await this.databaseFilesService.getFileById(user.avatarId);

		return {
			file: data,
			fileMetadata: { id, filename },
		};
	}

	// Upload files to Amazon S3
	async addAvatarUsingAmazonS3(userId: number, imageBuffer: Buffer, filename: string) {
		const avatar = await this.filesService.uploadPublicFile(imageBuffer, filename);
		const user = await this.getById(userId);
		await this.usersRepository.update(userId, {
			...user,
			avatar,
		});
		return avatar;
	}
}
