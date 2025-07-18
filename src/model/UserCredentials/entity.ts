import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, Validate, ValidateOptions, Schema } from '@lib/database';
import { User } from 'model/Users';

@ValidateOptions({ strict: true, async: true })
@Entity('user_credentials')
export class UserCredential {
    @Schema('list')
    @Validate('number|convert|optional')
    @PrimaryColumn('bigint', { name: 'user_id' })
    userId!: string;

    @Validate('string|optional')
    @Schema('list')
    @PrimaryColumn('varchar', { name: 'credential_id' })
    credentialId!: string;

    @Validate('string|optional')
    @Column('varchar', { name: 'public_key' })
    publicKey!: string;

    @Validate('number|optional')
    @Column('bigint')
    counter!: number;

    @Validate('string|optional')
    @Column('varchar')
    transports!: any;

    @Validate({ type: 'dto', dto: User, optional: true }) // DTO validation requires async validation
    @ManyToOne(() => User, (user) => user.credentials)
    @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
    user: User;
}
