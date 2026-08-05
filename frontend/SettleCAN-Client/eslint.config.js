import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // React Compiler rules (react-hooks v5+) — project does not use the
      // React Compiler, so disable these to avoid false positives.
      'react-hooks/purity':                      'off',
      'react-hooks/set-state-in-effect':          'off',
      'react-hooks/preserve-manual-memoization':  'off',
      'react-hooks/static-components':            'off',
    },
  },
])
