import { Entity, PrimaryColumn, Column } from 'typeorm';

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
}
