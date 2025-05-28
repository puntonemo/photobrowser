import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('media_sources')
export class MediaSource {
    @PrimaryGeneratedColumn()
    id!: string;

    @Column('bigint', { name: 'user_id' })
    userId!: string;

    @Column('varchar')
    path!: string;

    @Column('timestamp', { name: 'last_scan', transformer: {
        to(value) {
            return value?.toISOString();
        },
        from(value) {
            return value ? new Date(value) : undefined;
        },
    }, })
    lastScan!: Date;
}