import { defineConfig } from 'eslint/config'
import globals from 'globals'
import pluginVue from 'eslint-plugin-vue'
import pluginVueScopedCSS from '@vue/eslint-config-typescript'
import tseslint from 'typescript-eslint'

export default defineConfig([
  { files: ['**/*.{js,mjs,cjs,ts,vue}'] },
  { files: ['**/*.js'], languageOptions: { sourceType: 'script' } },
  { files: ['**/*.{js,mjs,cjs,ts,vue}'], languageOptions: { globals: globals.browser } },
  pluginVue.configs['flat/essential'],
  ...tseslint.configs.recommended,
  ...pluginVueScopedCSS.configs.recommended,
  { files: ['**/*.vue'], languageOptions: { parserOptions: { parser: tseslint.parser } } },
])