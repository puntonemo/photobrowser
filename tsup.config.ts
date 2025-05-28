import { defineConfig } from 'tsup';
import { globby } from 'globby';

export default defineConfig(async () => {
    const moduleEntries = await globby(['src/modules/**/index.ts']);

    return {
        entry: ['src/index.ts', ...moduleEntries],
        format: ['esm'],
        target: 'node18',
        outDir: 'dist',
        splitting: false,
        sourcemap: true,
        clean: true,
        tsconfig: './tsconfig.json',
        esbuildOptions(options) {
            options.alias = {
                '@core': './src/core',
                '@modules': './src/modules',
                '@lib': './src/lib',
                '@client': './src/client',
            };
            return options;
        },
    };
});
