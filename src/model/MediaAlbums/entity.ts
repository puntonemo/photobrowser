import { Entity, PrimaryGeneratedColumn, Column, OneToMany, JoinColumn, Validate, ValidateOptions, Schema } from '@lib/database';
import { MediaAlbumItem } from 'model/MediaAlbumItems';
import { UsersMediaAlbums } from 'model/UsersMediaAlbums';

@ValidateOptions({ strict: true, async: true })
@Entity('media_albums')
export class MediaAlbum {
    @Validate('number|convert|optional')
    @PrimaryGeneratedColumn()
    id!: string;

    @Schema('list')
    @Validate('string|optional')
    @Column('varchar')
    title!: string;

    @Validate('string|optional')
    @Column('varchar')
    description!: string;

    @Validate('date|optional')
    @Column('timestamp', { name: 'created_at', transformer: {
        to(value) {
            return value?.toISOString();
        },
        from(value) {
            return value ? new Date(value) : undefined;
        },
    }, })
    createdAt!: Date;

    @Validate('number|convert|optional')
    @Column('bigint', { name: 'created_by' })
    createdBy!: string;

    @Validate({ type: 'dto', dto: UsersMediaAlbums, optional: true }) // DTO validation requires async validation
    @OneToMany(() => UsersMediaAlbums, (usersMediaAlbums) => usersMediaAlbums.mediaAlbum)
    @JoinColumn({ name: 'id', referencedColumnName: 'media_album_id' })
    mediaAlbums: UsersMediaAlbums[];

    @Validate({ type: 'dto', dto: MediaAlbumItem, optional: true }) // DTO validation requires async validation
    @OneToMany(() => MediaAlbumItem, (mediaAlbumItem) => mediaAlbumItem.mediaAlbum)
    @JoinColumn({ name: 'id', referencedColumnName: 'media_album_id' })
    mediaItems: MediaAlbumItem[];
}