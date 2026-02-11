import js from '@eslint/js';
import pluginVue from 'eslint-plugin-vue';
import prettierConfig from 'eslint-config-prettier';

export default [
    js.configs.recommended,
    ...pluginVue.configs['flat/recommended'],
    prettierConfig,
    {
        files: ['src/**/*.{js,vue}'],
        rules: {
            'no-console': ['warn', { allow: ['warn', 'error'] }],
            'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            'vue/multi-word-component-names': 'off',
            'vue/no-unused-vars': 'warn',
        },
    },
    {
        ignores: ['dist/', 'node_modules/'],
    },
];
