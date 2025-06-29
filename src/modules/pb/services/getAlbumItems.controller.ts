import { Repositories } from 'model';
import { MediaItemFindDto } from 'model/MediaItems';
import { GenericFindDto } from 'model/_gen';

export default async (filters: Partial<MediaItemFindDto & GenericFindDto>) => {
    return Repositories.MediaItems.find(filters);
};
