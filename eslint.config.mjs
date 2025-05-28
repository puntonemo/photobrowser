// import eslintPluginReact from 'eslint-plugin-react';
// import eslintPluginReactHooks from 'eslint-plugin-react-hooks';
import eslintPluginPrettier from 'eslint-plugin-prettier';
// import { ESLint } from 'eslint';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';

export default [
    {
        files: ['**/*.ts', '**/*.tsx'],
        ignores: ['node_modules/', 'dist/'], // Asegúrate de que esta línea está presente
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
                ecmaFeatures: { jsx: true },
            },
        },
        plugins: {
            /*react: eslintPluginReact,*/
            /*'react-hooks': eslintPluginReactHooks,*/
            prettier: eslintPluginPrettier,
            '@typescript-eslint': tsPlugin,
        },
        settings: {
            react: {
                version: 'detect',
            },
        },
        rules: {
            'prettier/prettier': 'error',
            'react/react-in-jsx-scope': 'off',
            '@typescript-eslint/explicit-module-boundary-types': 'off',
        },
    },
];
