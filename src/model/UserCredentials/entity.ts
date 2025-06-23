import { User } from 'model/Users';
import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';

@Entity('user_credentials')
export class UserCredential {
    @PrimaryColumn('bigint', { name: 'user_id' })
    userId!: string;

    @PrimaryColumn('varchar', { name: 'credential_id' })
    credentialId!: string;

    @Column('varchar', { name: 'public_key' })
    publicKey!: string;

    @Column('bigint')
    counter!: number;

    @Column('varchar')
    transports!: any;

    @ManyToOne(() => User, (user) => user.credentials)
    @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
    user: User;
}
