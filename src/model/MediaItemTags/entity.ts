import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('media_item_tags')
export class MediaItemTag {
    @PrimaryGeneratedColumn()
    id!: string;

    @Column('bigint', { name: 'media_item_id' })
    mediaItemId!: string;

    @Column('varchar', { name: 'tag' })
    tag!: string;

    @Column('varchar', { name: 'tag_type' })
    tagType!: string;

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
}