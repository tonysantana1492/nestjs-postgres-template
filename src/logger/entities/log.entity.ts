import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Log {
	@PrimaryGeneratedColumn()
	public id: number;

	@Column({ nullable: true })
	public context: string;

	@Column()
	public message: string;

	@Column()
	public level: string;

	@CreateDateColumn()
	creationDate: Date;
}
