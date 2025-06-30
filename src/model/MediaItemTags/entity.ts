import { Entity, PrimaryGeneratedColumn, Column, Validate } from '@lib/database';

@Entity('media_item_tags')
export class MediaItemTag {
    @Validate('number|convert|optional')
    @PrimaryGeneratedColumn()
    id!: string;

    @Validate('number|convert|optional')
    @Column('bigint', { name: 'media_item_id' })
    mediaItemId!: string;

    @Validate('string|optional')
    @Column('varchar', { name: 'tag' })
    tag!: string;

    @Validate('string|optional')
    @Column('varchar', { name: 'tag_type' })
    tagType!: string;

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
}