import { ObjectLiteral, SelectQueryBuilder } from '@lib/database';
import { FilterFunction } from '../types';

export const eqFilter: FilterFunction = <ENTITY extends ObjectLiteral>(
    qb: SelectQueryBuilder<ENTITY>,
    column: string,
    value: any,
): void => {
    const columnsKey = column.replace(/\./g, '_');
    if (Array.isArray(value)) {
        qb.andWhere(`${column} IN (:...${columnsKey})`, { [columnsKey]: value });
    } else {
        qb.andWhere(`${column} = :${columnsKey}`, { [columnsKey]: value });
    }
};
