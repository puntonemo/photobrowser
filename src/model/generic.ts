import { DataSource, Repository, ObjectLiteral, FindOptionsWhere } from 'typeorm';

export class GenericRepository<ENTITY extends ObjectLiteral, FindDTO extends FindOptionsWhere<ENTITY>> {
    public repository: Repository<ENTITY>;
    public entityName: string;

    constructor(dataSource: DataSource, entity: { new (): ENTITY }) {
        console.log(`GenericRepository for`, entity.name);
        this.repository = dataSource.getRepository(entity);
        this.entityName = entity.name;
    }
    public async getOne(findOptions: Partial<FindDTO>): Promise<ENTITY | null> {
        return this.repository.findOneBy(findOptions as FindOptionsWhere<ENTITY>);
    }

    public async create(entity: Partial<ENTITY>): Promise<ENTITY> {
        const newEntity = this.repository.create(entity as ENTITY);
        return this.repository.save(newEntity);
    }
    public async find(findOptions: Partial<FindDTO>): Promise<ENTITY[] | null> {
        return this.repository.find(findOptions);
    }
}
