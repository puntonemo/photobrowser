
import { SelectQueryBuilder, ObjectLiteral } from '@lib/database';

export type FilterFunction = <ENTITY extends ObjectLiteral>(
    qb: SelectQueryBuilder<ENTITY>,
    column: string,
    value: any,
) => void;

export type GenericRepositoryOptions = {
    relations?: Array<string | Record<string, any>>;
    filters?: Array<string | { [filter: string]: FilterFunction }>;
    defaultPageSize?: number;
    entityName?: string;
};
