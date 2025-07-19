import { DataSource, Repository, ObjectLiteral, FindOptionsWhere, In, IsNull } from 'typeorm';
import { GenericFindDto } from './findDto';
import { GenericRepositoryOptions } from './types';

export class QBGenericRepository<ENTITY extends ObjectLiteral, FindDTO extends FindOptionsWhere<ENTITY>> {
    public readonly dataSource: DataSource;
    public readonly entity: { new (): ENTITY };
    public readonly repository: Repository<ENTITY>;
    public readonly entityName: string;
    public readonly relations: Array<string | Record<string, any>>;
    public readonly filters: string[];
    public readonly defaultPageSize: number;

    constructor(dataSource: DataSource, entity: { new (): ENTITY }, options?: GenericRepositoryOptions) {
        this.dataSource = dataSource;
        this.entity = entity;
        this.repository = dataSource.getRepository(entity);
        this.entityName = options?.entityName ?? entity.name;
        this.relations = options?.relations ?? [];
        this.filters = options?.filters ?? [];
        this.defaultPageSize = options?.defaultPageSize ?? 10;
        console.log(`Query Builder Generic Repository for`, this.entityName);
    }
    public async getOne(filters: Partial<FindDTO & GenericFindDto>): Promise<ENTITY | undefined> {
        const result = await this.find(filters);
        return result.data ? (result.data[0] ?? undefined) : undefined;
    }

    public async create(entity: Partial<ENTITY>): Promise<ENTITY> {
        const newEntity = this.repository.create(entity as ENTITY);
        return this.repository.save(newEntity);
    }

    public async find(filters: Partial<FindDTO & GenericFindDto>): Promise<{
        data?: ENTITY[];
        count?: number;
    }> {
        function intersection<T>(a: T[], b: T[]): T[] {
            const setB = new Set(b);
            return a.filter((item) => setB.has(item));
        }
        function getSchemaColumns(dataSource: DataSource, entityAlias: string, relationName: string, schema: string) {
            const metadata = dataSource.getMetadata(entityAlias);
            if (metadata && metadata.relations) {
                const relation = metadata.relations.find((r) => r.propertyName === relationName);
                if (schema && relation && relation.type) {
                    const relationMetadata = dataSource.getMetadata(relation.type);
                    if (relationMetadata) {
                        const relationColumns = relationMetadata.columns.map((column) => column.propertyName);
                        if ((relation.type as any)._schemas) {
                            const schemaColumns: any = (relation.type as any)._schemas[schema];
                            if (schemaColumns) {
                                const columns = intersection(schemaColumns, relationColumns).map((i) =>
                                    [relationName, i].join('.'),
                                );
                                return columns;
                            }
                        }
                        return relationColumns.map((i) => [relationName, i].join('.'));
                    }
                }
            }
            return [];
        }
        function getRelatedColumns(
            dataSource: DataSource,
            entityAlias: string,
            relations: GenericRepositoryOptions['relations'],
            filters: Record<string, any>,
            parentPath: string = entityAlias,
        ) {
            const relatedColumns: string[] = [];

            if (relations)
                for (const relation of relations) {
                    if (typeof relation === 'string') {
                        const include =
                            filters[relation] !== false
                                ? filters.relations === true || filters[relation] === true
                                : false;
                        if (include) {
                            const columns = getSchemaColumns(dataSource, parentPath, relation, filters.schema);
                            relatedColumns.push(...columns);
                        }
                    } else {
                        for (const [key, value] of Object.entries(relation)) {
                            const include =
                                filters[key] !== false ? filters.relations === true || filters[key] === true : false;
                            if (include) {
                                const columns = getSchemaColumns(dataSource, parentPath, key, filters.schema);
                                relatedColumns.push(...columns);
                                if (typeof value === 'object') {
                                    const childColumns = getRelatedColumns(dataSource, key, [value], filters, key);
                                    relatedColumns.push(...childColumns);
                                }
                            }
                        }
                    }
                }
            return relatedColumns;
        }
        function applyRelations(
            dataSource: DataSource,
            qb: ReturnType<Repository<ENTITY>['createQueryBuilder']>,
            entityAlias: string,
            relations: GenericRepositoryOptions['relations'],
            filters: Record<string, any>,
            aliasMap: Record<string, string>,
            parentPath: string = entityAlias,
        ) {
            const joinAndSelect = (path: string, alias: string) => {
                if (!qb.expressionMap.joinAttributes.some((j) => j.alias.name === alias)) {
                    qb.leftJoinAndSelect(path, alias);
                    aliasMap[path] = alias;
                }
            };

            if (relations)
                for (const relation of relations) {
                    if (typeof relation === 'string') {
                        const include =
                            filters[relation] !== false
                                ? filters.relations === true || filters[relation] === true
                                : false;
                        if (include) {
                            const path = `${parentPath}.${relation}`;
                            joinAndSelect(path, relation);
                        }
                    } else {
                        for (const [key, value] of Object.entries(relation)) {
                            const include =
                                filters[key] !== false ? filters.relations === true || filters[key] === true : false;
                            if (include) {
                                const path = `${parentPath}.${key}`;
                                joinAndSelect(path, key);
                                if (typeof value === 'object') {
                                    applyRelations(dataSource, qb, key, [value], relation[key], aliasMap, key);
                                }
                            }
                        }
                    }
                }
        }
        let qb = this.repository.createQueryBuilder(this.entityName);

        const findResult: {
            data?: ENTITY[];
            count?: number;
        } = {
            data: undefined,
            count: undefined,
        };
        const page = filters?.page ?? 1;
        const pageSize = filters?.pageSize ?? this.defaultPageSize;
        const skip = (page - 1) * pageSize;

        const aliasMap: Record<string, string> = {};

        /*** APPLY RELATIONS ***/
        applyRelations(this.dataSource, qb, this.entityName, this.relations, filters, aliasMap);

        /*** SELECT COLUMNS ***/
        const selectColumns: string[] = [];
        if (
            filters.schema &&
            this.entity.prototype.constructor._schemas &&
            this.entity.prototype.constructor._schemas[filters.schema]
        ) {
            const schemaColumns = this.entity.prototype.constructor._schemas[filters.schema];

            const columns = intersection(schemaColumns, this.getEntityColumns()).map((i) =>
                [this.entityName, i].join('.'),
            );

            selectColumns.push(...columns);
        }
        const relatedColumns = getRelatedColumns(this.dataSource, this.entityName, this.relations, filters);

        selectColumns.push(...relatedColumns);

        console.log('selectColumns', selectColumns);

        if (selectColumns.length > 0) qb = qb.select(selectColumns);

        if (filters.order) {
            qb = qb.addOrderBy(filters.order, (filters.ascending ?? true) ? 'ASC' : 'DESC');
        }

        // ilike filter with search
        // if (filters.search) {
        //     qb.andWhere(`${this.entityName}.email ILIKE :search OR ${this.entityName}.username ILIKE :search`, { search: `%${filters.search}%` });
        // }

        this.filters.forEach((filter) => {
            const uniqueValue =
                filter.split('.').length === 0 ? `${this.entityName}.${filter}` : filter.split('.').splice(-1)[0];
            const value = filters[filter] || filters[uniqueValue];
            if (value !== undefined) {
                const parameterKey = filter.replace(/\./g, '_');
                // const path = aliasMap[filter.split('.').slice(0, -1).join('.')]
                //     ? `${aliasMap[filter.split('.').slice(0, -1).join('.')!]}.${filter.split('.').slice(-1)[0]}`
                //     : `${this.entityName}.${filter}`;
                const path = filter;
                if (Array.isArray(value)) {
                    qb = qb.andWhere(`${path} IN (:...${parameterKey})`, { [parameterKey]: value });
                } else {
                    qb = qb.andWhere(`${path} = :${parameterKey}`, { [parameterKey]: value });
                }
            }
        });

        qb = qb.skip(skip);
        qb = qb.take(pageSize);

        if (!filters.count) {
            const result = await qb.getMany();
            findResult.data = result;
        }
        if ((filters.data ?? true) && filters.count) {
            const [result, count] = await qb.getManyAndCount();
            findResult.data = result;
            findResult.count = count;
        }
        if (!(filters.data ?? true) && filters.count) findResult.count = await qb.getCount();

        return findResult;
    }
    public async exists(filters: Partial<FindDTO>): Promise<boolean | null> {
        const data = await this.find({ ...filters, data: false, count: true } as FindDTO & GenericFindDto);
        return data.count ? data.count > 0 : false;
    }
    public getEntityColumns(): string[] {
        const metadata = this.dataSource.getMetadata(this.entity);
        return metadata.columns.map((column) => column.propertyName);
    }
    /*************/
    /*** UTILS ***/
    /*************/
}
