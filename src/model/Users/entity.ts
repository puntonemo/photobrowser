import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id!: string;

    @Column('varchar')
    username!: string;

    @Column('varchar')
    firstname!: string;

    @Column('varchar')
    lastname!: string;

    @Column('varchar')
    picture!: string;

    @Column('varchar')
    googleid!: string;

    @Column('varchar')
    liveid!: string;

    @Column('json')
    profile!: Record<string, any>;
}
