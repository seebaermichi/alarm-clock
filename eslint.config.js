import js from '@eslint/js'
import globals from 'globals'
import pluginVue from 'eslint-plugin-vue'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'

export default [
    {
        ignores: ['dist/**', 'dist-extension/**', 'node_modules/**']
    },
    js.configs.recommended,
    ...pluginVue.configs['flat/recommended'],
    // Prettier owns formatting; ESLint owns correctness. No overlap, no fights.
    skipFormatting,
    {
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module'
        },
        rules: {
            'vue/multi-word-component-names': 'off',
            'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off'
        }
    },
    {
        // App code runs in a document.
        files: ['src/**/*.{js,vue}', 'apps/**/*.{js,vue}'],
        languageOptions: {
            globals: globals.browser
        }
    },
    {
        // Workers have no document — `self`, not `window`. Scoping this keeps
        // ESLint honest about which globals actually exist where.
        files: ['src/workers/**/*.js'],
        languageOptions: {
            globals: globals.worker
        }
    },
    {
        // Build and test configs run in Node.
        files: ['*.config.js'],
        languageOptions: {
            globals: globals.node
        }
    }
]
