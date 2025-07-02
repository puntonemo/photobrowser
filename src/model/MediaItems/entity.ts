import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Schema, Validate, ValidateOptions } from '@lib/database';
import { MediaAlbumItem } from 'model/MediaAlbumItems';

@ValidateOptions({ strict: true, async: true })
@Entity('media_items')
export class MediaItem {
    @Schema('list')
    @Validate('number|convert|optional')
    @PrimaryGeneratedColumn()
    id!: string;

    @Validate('number|convert|optional')
    @Column('bigint', { name: 'user_id' })
    userId!: string;

    @Validate('number|convert|optional')
    @Column('bigint', { name: 'media_source_id' })
    mediaSourceId!: string;

    @Validate('string|optional')
    @Column('varchar')
    root!: string;

    @Validate('string|optional')
    @Column('varchar')
    path!: string;

    @Schema('list')
    @Validate('string|optional')
    @Column('varchar')
    basename!: string;

    @Schema('list')
    @Validate('string|optional')
    @Column('varchar')
    type!: 'video' | 'photo';

    @Validate('string|optional')
    @Column('varchar')
    signature!: string;

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
    lastScan: Date = new Date();

    @Validate('object|optional')
    @Column('json')
    metadata!: Record<string, any>;

    @Validate('number|optional')
    @Column('bigint', { name: 'file_size' })
    fileSize!: number;

    @Schema('list')
    @Validate('string|optional')
    @Column('varchar', { name: 'file_size_string' })
    fileSizeString!: string;

    @Schema('list')
    @Validate('date|optional')
    @Column('timestamp', {
        name: 'moment_ts',
        transformer: {
            to(value) {
                return value?.toISOString();
            },
            from(value) {
                return value ? new Date(value) : undefined;
            },
        },
    })
    momentTs!: Date;

    @Schema('list')
    @Validate('string|optional')
    @Column('varchar', { name: 'moment_year' })
    momentYear!: string;

    @Schema('list')
    @Validate('string|optional')
    @Column('varchar', { name: 'moment_month' })
    momentMonth!: string;

    @Schema('list')
    @Validate('string|optional')
    @Column('varchar', { name: 'moment_day' })
    momentDay!: string;

    @Validate('date|optional')
    @Column('timestamp', {
        name: 'metadata_ts',
        transformer: {
            to(value) {
                return value?.toISOString();
            },
            from(value) {
                return value ? new Date(value) : undefined;
            },
        },
    })
    metadataTs!: Date;

    @Validate('object|optional')
    @Column('json')
    location!: string;

    @Validate('string|optional')
    @Column('varchar', { name: 'location_status' })
    locationStatus!: string;

    @Schema('list')
    @Validate('string|optional')
    @Column('varchar', { name: 'location_label' })
    locationLabel!: string;

    @Validate('string|optional')
    @Column('varchar', { name: 'location_country_code' })
    locationCountryCode!: string;

    @Validate('string|optional')
    @Column('varchar', { name: 'location_country_name' })
    locationCountryName!: string;

    @Validate('string|optional')
    @Column('varchar', { name: 'location_state' })
    locationState!: string;

    @Validate('string|optional')
    @Column('varchar', { name: 'location_county' })
    locationCounty!: string;

    @Validate('string|optional')
    @Column('varchar', { name: 'location_city' })
    locationCity!: string;

    @Validate('string|optional')
    @Column('varchar', { name: 'location_district' })
    locationDistrict!: string;

    @Validate('string|optional')
    @Column('varchar', { name: 'location_street' })
    locationStreet!: string;

    @Validate('string|optional')
    @Column('varchar', { name: 'location_house_number' })
    locationHouseNumber!: string;

    @Validate('string|optional')
    @Column('varchar', { name: 'location_postal_code' })
    locationPostalCode!: string;

    @Validate('number|optional')
    @Column('float', { name: 'location_latitude' })
    locationLatitude!: number;

    @Validate('number|optional')
    @Column('float', { name: 'location_longitude' })
    locationLongitude!: number;

    @Validate('date|optional')
    @Column('timestamp', {
        name: 'location_ts',
        transformer: {
            to(value) {
                return value?.toISOString();
            },
            from(value) {
                return value ? new Date(value) : undefined;
            },
        },
    })
    locationTs!: Date;

    @Validate({ type: 'dto', dto: MediaAlbumItem, optional: true }) // DTO validation requires async validation
    @OneToMany(() => MediaAlbumItem, (mediaAlbumItem) => mediaAlbumItem.mediaItem)
    mediaAlbums: MediaAlbumItem[];
}
