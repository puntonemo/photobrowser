import { NotFoundResponseError } from '@core';
import { Repositories } from 'model';

export default async () => {
    const user = await Repositories.Users.getOne({ id: '1', mediaAlbums: true });

    if (!user) throw NotFoundResponseError();

    return user.mediaAlbums.map((i) => {
        return { ...i.mediaAlbum, role: i.role };
    });
}
