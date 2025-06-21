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

    @Column('json')
    metadata!: Record<string, any>;

    @Column('bigint', { name: 'file_size' })
    fileSize!: number;

    @Column('varchar', { name: 'file_size_string' })
    fileSizeString!: string;

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

    @Column('varchar', { name: 'moment_year' })
    momentYear!: string;

    @Column('varchar', { name: 'moment_month' })
    momentMonth!: string;

    @Column('varchar', { name: 'moment_day' })
    momentDay!: string;

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

    @Column('json')
    location!: string;

    @Column('varchar', { name: 'location_status' })
    locationStatus!: string;

    @Column('varchar', { name: 'location_label' })
    locationLabel!: string;

    @Column('varchar', { name: 'location_country_code' })
    locationCountryCode!: string;

    @Column('varchar', { name: 'location_country_name' })
    locationCountryName!: string;

    @Column('varchar', { name: 'location_state' })
    locationState!: string;

    @Column('varchar', { name: 'location_county' })
    locationCounty!: string;

    @Column('varchar', { name: 'location_city' })
    locationCity!: string;

    @Column('varchar', { name: 'location_district' })
    locationDistrict!: string;

    @Column('varchar', { name: 'location_street' })
    locationStreet!: string;

    @Column('varchar', { name: 'location_house_number' })
    locationHouseNumber!: string;

    @Column('varchar', { name: 'location_postal_code' })
    locationPostalCode!: string;

    @Column('float', { name: 'location_latitude' })
    locationLatitude!: number;

    @Column('float', { name: 'location_longitude' })
    locationLongitude!: number;

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
}
