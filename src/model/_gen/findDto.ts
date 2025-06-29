export class GenericFindDto {
    // @Validate({ type: 'enum', values: columns, optional: true })
    order!: string;

    // @Validate('boolean|convert|optional')
    ascending!: boolean;

    // @Validate('number|min:1|default:1|convert|optional')
    page: number = 1;

    // @Validate('number|min:1|max:100|default:10|convert|optional')
    pageSize: number = 10;

    // @Validate('string|optional')
    schema!: string;

    // @Validate(['boolean|convert|optional', { type: 'enum', values: ['exact', 'planned', 'estimated'], optional: true }])
    count: boolean = false;

    // @Validate('boolean|default:true|convert|optional')
    data: boolean = true;

    // @Validate('boolean|convert|optional')
    relations: boolean = false;
}
