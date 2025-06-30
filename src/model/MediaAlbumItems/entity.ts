import { Entity, PrimaryColumn, Column, JoinColumn, ManyToOne, Validate, ValidateOptions } from '@lib/database';
import { MediaAlbum } from 'model/MediaAlbums';
import { MediaItem } from 'model/MediaItems';

@ValidateOptions({ strict: true, async: true })
@Entity('media_album_items')
export class MediaAlbumItem {
    @Validate('number|convert|optional')
    @PrimaryColumn('bigint', { name: 'media_album_id' })
    mediaAlbumId!: string;

    @Validate('number|convert|optional')
    @PrimaryColumn('bigint', { name: 'media_item_id' })
    mediaItemId!: string;

    @Validate('date|optional')
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

    @Validate('number|convert|optional')
    @Column('bigint', { name: 'created_by' })
    createdBy!: string;

    @Validate({ type: 'dto', dto: MediaItem, optional: true }) // DTO validation requires async validation
    @ManyToOne(() => MediaItem, (mediaItem) => mediaItem.mediaAlbums)
    @JoinColumn({ name: 'media_item_id' })
    mediaItem: MediaItem;

    @Validate({ type: 'dto', dto: MediaAlbum, optional: true }) // DTO validation requires async validation
    @ManyToOne(() => MediaAlbum, (mediaAlbum) => mediaAlbum.mediaItems)
    @JoinColumn({ name: 'media_album_id', referencedColumnName: 'id' })
    mediaAlbum: MediaAlbum;
}
