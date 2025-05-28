import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('media_items')
export class MediaItem {
    @PrimaryGeneratedColumn()
    id!: string;

    @Column('bigint', { name: 'user_id' })
    userId!: string;

    @Column('bigint', { name: 'media_source_id' })
    mediaSourceId!: string;

    @Column('varchar')
    root!: string;

    @Column('varchar')
    path!: string;

    @Column('varchar')
    basename!: string;

    @Column('varchar')
    type!: 'video' | 'photo';

    @Column('varchar')
    signature!: string;

    @Column('timestamp', { name: 'created_at', transformer: {
        to(value) {
            return value?.toISOString();
        },
        from(value) {
            return value ? new Date(value) : undefined;
        },
    }, })
    lastScan: Date = new Date();

    @Column('json')
    metadata!: Record<string, any>;

    @Column('timestamp', { name: 'metadata_ts', transformer: {
        to(value) {
            return value?.toISOString();
        },
        from(value) {
            return value ? new Date(value) : undefined;
        },
    }, })
    metadataTs!: Date;

}