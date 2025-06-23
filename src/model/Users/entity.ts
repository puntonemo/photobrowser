import { UserCredential } from 'model/UserCredentials';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, JoinColumn } from 'typeorm';

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

    get displayname() {
        return `${this.firstname} ${this.lastname}`.trim();
    }

    @OneToMany(() => UserCredential, (credential) => credential.user)
    @JoinColumn({ name: 'id', referencedColumnName: 'user_id' })
    credentials: UserCredential[];
}
