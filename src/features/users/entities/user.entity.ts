import { Exclude } from 'class-transformer';
import { Role } from 'src/authorization/role.enum';
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Address } from './address.entity';

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

	@Column()
	@Exclude()
	public password: string;

	@Column({ nullable: true })
	@Exclude()
	public currentHashedRefreshToken?: string;

	@Column({ nullable: true })
	@Exclude()
	public twoFactorAuthenticationSecret?: string;

	@Column({ default: false })
	public isTwoFactorAuthenticationEnabled: boolean;

	@Column({ default: false })
	public isRegisteredWithGoogle?: boolean;
}
