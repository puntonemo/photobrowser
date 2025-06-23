import { CoreService } from '@core';
import * as controllers from '../controllers';

export const test = new CoreService(
    {
        get: '/api/test',
        meta: {
            limit: 5,
        },
    },
    async (request) => {
        // Accede a la sesión (asegúrate de que el plugin está registrado)
        const session = request.session as any;

        // Incrementa el contador de visitas
        return controllers.test(session);
    },
);
