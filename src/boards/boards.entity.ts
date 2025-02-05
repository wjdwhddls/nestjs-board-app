import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BoardStatus } from './boards-status.enum';
import { User } from 'src/auth/users.entity';

@Entity()
export class Board {
    @PrimaryGeneratedColumn() // PK + AutoIncrement
    id: number;

    @Column()
    author: string;

    @Column()
    title: string;

    @Column()
    contents: string;

    @Column()
    status: BoardStatus;
    // password: string;
    @ManyToOne(Type => User, user => user.boards, { eager: false})
    user: User;
}