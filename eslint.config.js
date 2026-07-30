import js from '@eslint/js'
import globals from 'globals'
import pluginVue from 'eslint-plugin-vue'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'

export default [
    {
        // design/ holds generated handoff artefacts from the design pass,
        // not code we maintain.
        ignores: ['dist/**', 'dist-extension/**', 'node_modules/**', 'design/**']
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
        // Extension code additionally sees chrome.* / browser.*.
        files: ['apps/extension/**/*.js'],
        languageOptions: {
            globals: { ...globals.browser, ...globals.webextensions }
        }
    },
    {
        // Build and test configs run in Node. The second pattern catches the
        // per-target configs, e.g. vite.config.extension.js.
        files: ['*.config.js', '*.config.*.js'],
        languageOptions: {
            globals: globals.node
        }
    }
]
