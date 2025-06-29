import { DataSource, Repository, ObjectLiteral, FindOptionsWhere, In, IsNull } from 'typeorm';
import { GenericFindDto } from './findDto';
import { GenericRepositoryOptions } from './types';

export class QBGenericRepository<ENTITY extends ObjectLiteral, FindDTO extends FindOptionsWhere<ENTITY>> {
    public readonly repository: Repository<ENTITY>;
    public readonly entityName: string;
    public readonly relations: Array<string | Record<string, any>>;
    public readonly filters: string[];
    public readonly defaultPageSize: number;

    constructor(dataSource: DataSource, entity: { new (): ENTITY }, options?: GenericRepositoryOptions) {
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

    private applyRelations(
        qb: ReturnType<Repository<ENTITY>['createQueryBuilder']>,
        entityAlias: string,
        relations: GenericRepositoryOptions['relations'],
        filters: Record<string, any>,
        aliasMap: Record<string, string>,
        parentPath: string = entityAlias,
    ) {
        const join = (path: string, alias: string) => {
            if (!qb.expressionMap.joinAttributes.some((j) => j.alias.name === alias)) {
                qb.leftJoinAndSelect(path, alias);
                aliasMap[path] = alias;
            }
        };

        if (relations)
            for (const relation of relations) {
                if (typeof relation === 'string') {
                    const include =
                        filters[relation] !== false ? filters.relations === true || filters[relation] === true : false;
                    if (include) {
                        const path = `${parentPath}.${relation}`;
                        join(path, relation);
                    }
                } else {
                    for (const [key, value] of Object.entries(relation)) {
                        const include =
                            filters[key] !== false ? filters.relations === true || filters[key] === true : false;
                        if (include) {
                            const path = `${parentPath}.${key}`;
                            join(path, key);
                            if (typeof value === 'object') {
                                this.applyRelations(qb, key, [value], filters, aliasMap, key);
                            }
                        }
                    }
                }
            }
    }
    public async find(filters: Partial<FindDTO & GenericFindDto>): Promise<{
        data?: ENTITY[];
        count?: number;
    }> {
        const qb = this.repository.createQueryBuilder(this.entityName);

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
        this.applyRelations(qb, this.entityName, this.relations, filters, aliasMap);

        if (filters.order) {
            qb.addOrderBy(filters.order, (filters.ascending ?? true) ? 'ASC' : 'DESC');
        }

        // ilike filter with search
        // if (filters.search) {
        //     qb.andWhere(`${this.entityName}.email ILIKE :search OR ${this.entityName}.username ILIKE :search`, { search: `%${filters.search}%` });
        // }
        
        this.filters.forEach((filter) => {
            const value = filters[filter];
            if (value !== undefined) {
                const parameterKey = filter.replace(/\./g, '_');
                // const path = aliasMap[filter.split('.').slice(0, -1).join('.')] 
                //     ? `${aliasMap[filter.split('.').slice(0, -1).join('.')!]}.${filter.split('.').slice(-1)[0]}`
                //     : `${this.entityName}.${filter}`;
                const path = filter;
                if (Array.isArray(value)) {
                    qb.andWhere(`${path} IN (:...${parameterKey})`, { [parameterKey]: value });
                } else {
                    qb.andWhere(`${path} = :${parameterKey}`, { [parameterKey]: value });
                }
            }
        });

        qb.skip(skip);
        qb.take(pageSize);

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
}
