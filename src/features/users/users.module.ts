import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { LocalFilesModule } from '../local-files/local-files.module';
import { DatabaseFilesModule } from '../database-files/database-files.module';
import { FilesModule } from '../files/files.module';

@Module({
	imports: [TypeOrmModule.forFeature([User]), LocalFilesModule, DatabaseFilesModule, FilesModule],
	controllers: [UsersController],
	providers: [UsersService],
	exports: [UsersService],
})
export class UsersModule {}
