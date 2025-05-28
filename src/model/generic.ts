import { DataSource, Repository, ObjectLiteral, FindOptionsWhere } from "typeorm";

export class GenericRepository<T extends ObjectLiteral, U extends FindOptionsWhere<T>> {
    public repository: Repository<T>;
    public entityName: string;

    constructor(
        dataSource: DataSource,
        entity: { new (): T }
    ) {
        this.repository = dataSource.getRepository(entity);
        this.entityName = entity.name;
    }
    public async getOne(findOptions: Partial<U>): Promise<T | null> {
        return this.repository.findOneBy(findOptions as FindOptionsWhere<T>);
    }

    public async create(entity: Partial<T>): Promise<T> {
        const newEntity = this.repository.create(entity as T);
        return this.repository.save(newEntity);
    }
}