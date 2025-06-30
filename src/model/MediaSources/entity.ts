import { Entity, PrimaryGeneratedColumn, Column, Validate } from '@lib/database';

@Entity('media_sources')
export class MediaSource {
    @Validate('number|convert|optional')
    @PrimaryGeneratedColumn()
    id!: string;

    @Validate('number|convert|optional')
    @Column('bigint', { name: 'user_id' })
    userId!: string;

    @Validate('string')
    @Column('varchar')
    path!: string;

    @Validate('date|optional')
    @Column('timestamp', {
        name: 'last_scan',
        transformer: {
            to(value) {
                return value?.toISOString();
            },
            from(value) {
                return value ? new Date(value) : undefined;
            },
        },
    })
    lastScan!: Date;

    @Validate('number|convert|optional')
    @Column('bigint', { name: 'media_album_id' })
    mediaAlbumId!: string;
}
