import { NotFoundResponseError } from '@core';
import { Repositories } from 'model';

export default async (userId: string) => {
    const user = await Repositories.Users.getOne({ id: userId, mediaAlbums: true });

    if (!user) throw NotFoundResponseError();

    return user.mediaAlbums.map((i) => {
        return { ...i.mediaAlbum, role: i.role };
    });
};
