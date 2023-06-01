import { Exclude } from 'class-transformer';
import { Role } from 'src/authorization/role.enum';
import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Address } from './address.entity';
// import { DatabaseFile } from 'src/features/database-files/entities/database-file.entity';
import { PrivateFile } from 'src/features/files/entities/private-file.entity';
import { LocalFile } from 'src/features/local-files/entities/local-file.entity';
import { Permission } from 'src/authorization/types/permission.type';

@Entity()
export class User {
	@PrimaryGeneratedColumn()
	public id: number;

	@Column({ unique: true })
	public email: string;

	@Column({ default: false })
	public isEmailConfirmed?: boolean;

	@Column({ type: 'enum', enum: Role, default: Role.User })
	role?: Role;

	@Column()
	public name: string;

	@Column({ nullable: true })
	public phoneNumber?: string;

	@OneToOne(() => Address, (address: Address) => address.user, {
		eager: true,
		cascade: true,
	})
	@JoinColumn()
	public address?: Address;

	@Column({
		type: 'enum',
		enum: Permission,
		array: true,
		default: [],
	})
	public permissions?: Permission[];

	@Column()
	@Exclude()
	public password: string;

	@Column({ nullable: true })
	@Exclude()
	public currentHashedRefreshToken?: string;

	// TODO: use Amazon S3 to store avatar publicly
	// @JoinColumn()
	// @OneToOne(() => PublicFile, {
	//   eager: true,
	//   nullable: true,
	// })
	// public avatar?: PublicFile;

	// TODO: store file directly to postgres database
	// @JoinColumn({ name: 'avatarId' })
	// @OneToOne(() => DatabaseFile, {
	// 	nullable: true,
	// })
	// public avatar?: DatabaseFile;

	// TODO: store file into the sistem file
	@JoinColumn({ name: 'avatarId' })
	@OneToOne(() => LocalFile, {
		nullable: true,
	})
	public avatar?: LocalFile;

	// TODO: this field is necessary only for storing files to postgres database
	@Column({ nullable: true })
	public avatarId?: number;

	@OneToMany(() => PrivateFile, (file: PrivateFile) => file.owner)
	public files?: PrivateFile[];

	@Column({ nullable: true })
	@Exclude()
	public twoFactorAuthenticationSecret?: string;

	@Column({ default: false })
	public isTwoFactorAuthenticationEnabled: boolean;

	@Column({ default: false })
	public isRegisteredWithGoogle?: boolean;
}
