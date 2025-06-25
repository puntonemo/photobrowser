import { UsersMediaAlbums } from 'model/UsersMediaAlbums';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, JoinColumn } from 'typeorm';

@Entity('media_albums')
export class MediaAlbum {
    @PrimaryGeneratedColumn()
    id!: string;

    @Column('varchar')
    title!: string;

    @Column('varchar')
    description!: string;

    @Column('timestamp', { name: 'created_at', transformer: {
        to(value) {
            return value?.toISOString();
        },
        from(value) {
            return value ? new Date(value) : undefined;
        },
    }, })
    createdAt!: Date;

    @Column('bigint', { name: 'created_by' })
    createdBy!: string;

    @OneToMany(() => UsersMediaAlbums, (usersMediaAlbums) => usersMediaAlbums.mediaAlbum)
    @JoinColumn({ name: 'id', referencedColumnName: 'media_album_id' })
    mediaAlbums: UsersMediaAlbums[];
}