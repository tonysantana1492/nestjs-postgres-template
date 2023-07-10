import {
	BadRequestException,
	CacheKey,
	CacheTTL,
	Controller,
	Delete,
	Get,
	Param,
	ParseIntPipe,
	Post,
	Req,
	Res,
	StreamableFile,
	UploadedFile,
	UseInterceptors,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiParam, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { LocalFilesInterceptor } from '../local-files/local-files.interceptor';
import { FileUploadDto } from './dto/file-upload.dto';
import { RequestWithUser } from 'src/authentication/interfaces/request-with-user.interface';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthRoles } from 'src/authorization/decorators/role.decorator';

@Controller('users')
@ApiTags('users')
@ApiBearerAuth()
@AuthRoles()
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Get('')
	@CacheKey('USERS')
	@CacheTTL(120)
	async findAll(): Promise<User[]> {
		return this.usersService.getAllUsers();
	}

	@Get(':email')
	@ApiParam({
		name: 'email',
		required: true,
		description: 'Should be a valid email for the user to fetch',
		type: String,
	})
	async findOne(@Param('email') email: string) {
		return this.usersService.getByEmail(email);
	}

	@Get(':userId/avatar/local')
	async getAvatar(
		@Param('userId', ParseIntPipe) userId: number,
		@Res({ passthrough: true }) response: Response,
		@Req() request: Request,
	) {
		const { file, fileMetadata } = await this.usersService.getAvatar(userId);

		const tag = `W/"file-id-${fileMetadata.id}"`;

		response.set({
			'Content-Disposition': `inline; filename="${fileMetadata.filename}"`,
			'Content-Type': fileMetadata.mimetype,
			ETag: tag,
		});

		if (request.headers['if-none-match'] === tag) {
			response.status(304);
			return;
		}

		return new StreamableFile(file);
	}

	@Post('avatar/local')
	@ApiConsumes('multipart/form-data')
	@ApiBody({
		description: 'A new avatar for the user',
		type: FileUploadDto,
	})
	@UseInterceptors(
		LocalFilesInterceptor({
			fieldName: 'file',
			path: '/avatars',
			fileFilter: (request, file, callback) => {
				if (!file.mimetype.includes('image')) {
					return callback(new BadRequestException('Provide a valid image'), false);
				}
				callback(null, true);
			},
			limits: {
				fileSize: Math.pow(1024, 2), // 1 MB
			},
		}),
	)
	async addAvatar(@Req() request: RequestWithUser, @UploadedFile() file: Express.Multer.File) {
		return this.usersService.addAvatar(request.user.id, {
			path: file.path,
			filename: file.originalname,
			mimetype: file.mimetype,
		});
	}

	@Delete('avatar')
	async deleteAvatar(@Req() request: RequestWithUser) {
		return this.usersService.deleteAvatar(request.user.id);
	}

	@Post('avatar/amazonS3')
	@ApiConsumes('multipart/form-data')
	@ApiBody({
		description: 'A new avatar for the user',
		type: FileUploadDto,
	})
	@UseInterceptors(FileInterceptor('file'))
	async addAvatarOnAmazonS3(@Req() request: RequestWithUser, @UploadedFile() file: Express.Multer.File) {
		return this.usersService.addAvatarUsingAmazonS3(request.user.id, file.buffer, file.originalname);
	}

	@Get(':userId/avatar/postgres')
	async getAvatarInPGsql(
		@Param('userId', ParseIntPipe) userId: number,
		@Res({ passthrough: true }) response: Response,
		@Req() request: Request,
	) {
		const { file, fileMetadata } = await this.usersService.getAvatarInPGsql(userId);

		const tag = `W/"file-id-${fileMetadata.id}"`;

		response.set({
			'Content-Disposition': `inline; filename="${fileMetadata.filename}"`,
			// 'Content-Type': fileMetadata.mimetype,
			ETag: tag,
		});

		if (request.headers['if-none-match'] === tag) {
			response.status(304);
			return;
		}

		return new StreamableFile(file);
	}

	@Post('avatar/postgres')
	@ApiConsumes('multipart/form-data')
	@ApiBody({
		description: 'A new avatar for the user',
		type: FileUploadDto,
	})
	@UseInterceptors(FileInterceptor('file'))
	async addAvatarOnPostgres(@Req() request: RequestWithUser, @UploadedFile() file: Express.Multer.File) {
		return this.usersService.addAvatarInPGsql(request.user.id, file.buffer, file.originalname);
	}
}
