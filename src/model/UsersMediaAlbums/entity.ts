import { Entity, PrimaryColumn, Column, JoinColumn, ManyToOne, Validate, ValidateOptions, Schema } from '@lib/database';
import { MediaAlbum } from 'model/MediaAlbums';
import { User } from 'model/Users';

@ValidateOptions({ strict: true, async: true })
@Entity('user_media_albums')
export class UsersMediaAlbums {
    @Validate('number|convert|optional')
    @PrimaryColumn('bigint', { name: 'user_id' })
    userId!: string;

    @Validate('number|convert|optional')
    @PrimaryColumn('bigint', { name: 'media_album_id' })
    mediaAlbumId!: string;

    @Schema('list')
    @Validate('string')
    @Column('varchar')
    role: string;

    @Validate({ type: 'dto', dto: User, optional: true }) // DTO validation requires async validation
    @ManyToOne(() => User, (user) => user.mediaAlbums)
    @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
    user: User;

    @Validate({ type: 'dto', dto: MediaAlbum, optional: true }) // DTO validation requires async validation
    @ManyToOne(() => MediaAlbum, (mediaAlbum) => mediaAlbum.mediaAlbums)
    @JoinColumn({ name: 'media_album_id', referencedColumnName: 'id' })
    mediaAlbum: MediaAlbum;
}
