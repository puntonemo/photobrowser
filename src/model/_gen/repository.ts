import { DataSource, Repository, ObjectLiteral, FindOptionsWhere, In, IsNull } from 'typeorm';
import { GenericFindDto } from './findDto';
import { GenericRepositoryOptions } from './types';

export class GenericRepository<ENTITY extends ObjectLiteral, FindDTO extends FindOptionsWhere<ENTITY>> {
    public readonly dataSource: DataSource;
    public readonly entity: { new (): ENTITY };
    public readonly repository: Repository<ENTITY>;
    public readonly entityName: string;
    public readonly relations: Array<string | Record<string, any>>;
    public readonly filters: string[];
    public readonly defaultPageSize: number;

    constructor(dataSource: DataSource, entity: { new (): ENTITY }, options?: GenericRepositoryOptions) {
        console.log(`GenericRepository for`, entity.name);
        this.dataSource = dataSource;
        this.entity = entity;
        this.repository = dataSource.getRepository(entity);
        this.entityName = entity.name;
        this.relations = options?.relations ?? [];
        this.filters = options?.filters ?? [];
        this.defaultPageSize = options?.defaultPageSize ?? 10;
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

        const findOptions: any = { take: pageSize, skip, where: {}, order: {}, relations: {} };

        for (const relation of this.relations) {
            if (typeof relation === 'string') {
                findOptions.relations[relation] =
                    filters[relation] !== false ? filters.relations === true || filters[relation] === true : false;
            } else {
                for (const entry of Object.entries(relation)) {
                    findOptions.relations[entry[0]] =
                        filters[entry[0]] && filters[entry[0]] !== false
                            ? entry[1]
                            : filters.relations === true
                              ? entry[1]
                              : false;
                }
            }
        }

        if (filters.order) {
            findOptions.order[filters.order] = (filters.ascending ?? true) ? 'ASC' : 'DESC';
        }

        this.filters.map((filter) => {
            if (filters[filter] !== undefined)
                filters[filter] === null
                    ? (findOptions.where[filter] = IsNull())
                    : (findOptions.where[filter] = Array.isArray(filters[filter])
                          ? In(filters[filter])
                          : filters[filter]);
        });

        if (!filters.count) {
            const result = await this.repository.find(findOptions);

            findResult.data = result;
        }
        if ((filters.data ?? true) && filters.count) {
            const [result, count] = await this.repository.findAndCount(findOptions);

            findResult.data = result;
            findResult.count = count;
        }
        if (!(filters.data ?? true) && filters.count) findResult.count = await this.repository.count(findOptions);

        return findResult;
    }
    public async exists(filters: Partial<FindDTO>): Promise<boolean | null> {
        const data = await this.find({ ...filters, data: false, count: true } as FindDTO & GenericFindDto);
        return data.count ? data.count > 0 : false;
    }
}
