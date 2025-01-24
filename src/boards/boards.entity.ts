import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BoardStatus } from './boards-status.enum';

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
}