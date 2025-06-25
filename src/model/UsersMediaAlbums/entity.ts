import { MediaAlbum } from 'model/MediaAlbums';
import { User } from 'model/Users';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

@Entity('user_media_albums')
export class UsersMediaAlbums {
    @PrimaryColumn('bigint', { name: 'user_id' })
    userId!: string;

    @PrimaryColumn('bigint', { name: 'media_album_id' })
    mediaAlbumId!: string;

    @Column('varchar')
    role: string;

    @ManyToOne(() => User, (user) => user.mediaAlbums)
    @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
    user: User;

    @ManyToOne(() => MediaAlbum, (mediaAlbum) => mediaAlbum.mediaAlbums)
    @JoinColumn({ name: 'media_album_id', referencedColumnName: 'id' })
    mediaAlbum: MediaAlbum;
}
