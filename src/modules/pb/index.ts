import { CoreModule } from '@core';
import * as services from './services';
import chokidar, { FSWatcher } from 'chokidar';
import * as controllers from './controllers';

import { Repositories } from 'model';

export const videoExtensions = ['mp4', 'mov'];
export const imageExtensions = ['jpg', 'jpeg', 'png', 'heic'];
export const watchers = new Map<string, FSWatcher>();

export const pbModule = new CoreModule('pb', {
    services,
    init: async () => {
        console.log('photobrowser module init');
        const rootPath = '/home/david/Test';
        const watchedRoots = ['/home/david/Test'];

        const allowedExts = [...videoExtensions, ...imageExtensions];
        const extPattern = allowedExts.join('|'); // => "jpg|jpeg|png|heic"
        const ignored = new RegExp(`(^|[/\\\\])\\..|\\.(?!(${extPattern})$)`, 'i');

        const mediaSources = await Repositories.MediaSources.find({});

        if (mediaSources && mediaSources.data && mediaSources.data.length > 0) {
            for (const mediaSource of mediaSources.data) {
                console.log('Adding watcher to MediaSource', mediaSource.id, mediaSource.path);

                const watcher = chokidar.watch(mediaSource.path, {
                    ignored: ignored, // ignora archivos ocultos
                    persistent: true,
                    ignoreInitial: true,
                    depth: Infinity,
                });
                watcher.on('add', (filePath) => {
                    const base = watchedRoots.find((r) => filePath.startsWith(r));
                    if (!base) return;
                    const path = filePath.replace(`${base}/`, '');

                    let resolveTask: () => void;
                    const wrapper = new Promise<void>((resolve) => (resolveTask = resolve));

                    // Añade primero al set
                    pendingTasks.add(wrapper);

                    // Lanza el trabajo
                    controllers
                        .newMediaItem(base, path)
                        .catch((err) => console.error('❌ Error procesando', filePath, err))
                        .finally(() => {
                            resolveTask();
                            pendingTasks.delete(wrapper);
                        });

                    // Reinicia el debounce
                    if (debounceTimeout) clearTimeout(debounceTimeout);
                    debounceTimeout = setTimeout(async () => {
                        await Promise.all(Array.from(pendingTasks));
                        onAllTasksFinished();
                    }, 1000);
                });
                watcher.on('unlink', (filePath) => {
                    const base = watchedRoots.find((r) => filePath.startsWith(r));
                    if (!base) return;
                    console.log(`file removed`, filePath);
                });
                watchers.set(mediaSource.id, watcher);
            }
        }

        const pendingTasks = new Set<Promise<void>>();
        let debounceTimeout: NodeJS.Timeout | undefined;

        function onAllTasksFinished() {
            console.log('✅ Todos los archivos nuevos han sido procesados');
            controllers.extractPendingMetadata();
        }
    },
});
