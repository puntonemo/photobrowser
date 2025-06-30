import { Entity, PrimaryGeneratedColumn, OneToMany, JoinColumn, Validate, ValidateOptions } from '@lib/database';
import { UsersMediaAlbums } from 'model/UsersMediaAlbums';
import { UserCredential } from 'model/UserCredentials';

@ValidateOptions({ strict: true, async: true })
@Entity('users')
export class User {
    @Validate('number|convert|optional')
    @PrimaryGeneratedColumn()
    id!: string;

    @Validate('string|optional')
    username!: string;

    @Validate('string|optional')
    firstname!: string;

    @Validate('string|optional')
    lastname!: string;

    @Validate('string|optional')
    picture!: string;

    @Validate('string|optional')
    googleid!: string;

    @Validate('string|optional')
    liveid!: string;

    @Validate('object|optional')
    profile!: Record<string, any>;

    @Validate('string|optional')
    get displayname() {
        return `${this.firstname} ${this.lastname}`.trim();
    }

    @Validate({ type: 'dto', dto: UserCredential, optional: true }) // DTO validation requires async validation
    @OneToMany(() => UserCredential, (credential) => credential.user)
    @JoinColumn({ name: 'id', referencedColumnName: 'user_id' })
    credentials: UserCredential[];

    @Validate({ type: 'dto', dto: UsersMediaAlbums, optional: true }) // DTO validation requires async validation
    @OneToMany(() => UsersMediaAlbums, (usersMediaAlbums) => usersMediaAlbums.user)
    @JoinColumn({ name: 'id', referencedColumnName: 'user_id' })
    mediaAlbums: UsersMediaAlbums[];
}
