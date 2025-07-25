import { ObjectLiteral, SelectQueryBuilder } from '@lib/database';
import { FilterFunction } from '../types';

export const likeFilter: FilterFunction = <ENTITY extends ObjectLiteral>(
    qb: SelectQueryBuilder<ENTITY>,
    column: string,
    value: any,
): void => {
    const columnsKey = column.replace(/\./g, '_');
    qb.andWhere(`${column} LIKE :${columnsKey}`, { [columnsKey]: `%${value}%` });
};
