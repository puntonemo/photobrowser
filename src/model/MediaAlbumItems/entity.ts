import { MediaAlbum } from 'model/MediaAlbums';
import { MediaItem } from 'model/MediaItems';
import { Entity, PrimaryColumn, Column, JoinColumn, ManyToOne } from 'typeorm';

@Entity('media_album_items')
export class MediaAlbumItem {
    @PrimaryColumn('bigint', { name: 'media_album_id' })
    mediaAlbumId!: string;

    @PrimaryColumn('bigint', { name: 'media_item_id' })
    mediaItemId!: string;

    @Column('timestamp', {
        name: 'created_at',
        transformer: {
            to(value) {
                return value?.toISOString();
            },
            from(value) {
                return value ? new Date(value) : undefined;
            },
        },
    })
    createdAt!: Date;

    @Column('bigint', { name: 'created_by' })
    createdBy!: string;

    @ManyToOne(() => MediaItem, (mediaItem) => mediaItem.mediaAlbums)
    @JoinColumn({ name: 'media_item_id', referencedColumnName: 'id' })
    mediaItem: MediaItem;

    @ManyToOne(() => MediaAlbum, (mediaAlbum) => mediaAlbum.mediaItems)
    @JoinColumn({ name: 'media_album_id', referencedColumnName: 'id' })
    mediaAlbum: MediaAlbum;
}
