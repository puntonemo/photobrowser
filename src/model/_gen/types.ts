export type GenericRepositoryOptions = {
    relations?: Array<string | Record<string, any>>;
    filters?: string[];
    defaultPageSize?: number;
    entityName?: string;
};
