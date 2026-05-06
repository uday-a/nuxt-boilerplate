// @ts-check
// @nuxt/eslint generates the base rules from installed modules and the
// `eslint.config` block in nuxt.config.ts. Extend here for project-wide
// overrides.
//
// NOTE: flat config requires plugins to be loaded in the same config object
// that references their rules. @nuxt/eslint registers `@stylistic` in its
// own slice, so we re-load it here before extending its rules.
import stylistic from '@stylistic/eslint-plugin'
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  {
    ignores: [
      '.pilot-backup/**',
      'server/db/migrations/**',
      '.nuxt/**',
      '.output/**',
      'dist/**',
    ],
  },
  {
    plugins: {
      '@stylistic': stylistic,
    },
    rules: {
      // Pages and layouts use single-word filenames intentionally — they're
      // route segments, not reusable components.
      'vue/multi-word-component-names': 'off',
      // Boilerplate ships with seed/demo data using `any` for brevity; we'd
      // rather not noise-up the lint for code users will replace.
      '@typescript-eslint/no-explicit-any': 'off',
      // reka-ui's emitter types intentionally split overloads for narrowing.
      '@typescript-eslint/unified-signatures': 'off',
      // Unused imports in the seed pages aren't bugs we care to gate commits
      // on; downgrade to a warning so real new violations still show up.
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-unused-vars': 'off',
      // Vue components legitimately use `ref.value` inside computed() to
      // declare a reactivity dependency without using the value. Don't error
      // on that idiom.
      '@typescript-eslint/no-unused-expressions': 'warn',
      // shadcn-vue derived registry code occasionally collides prop/ref
      // names. Surface but don't block boilerplate commits.
      'vue/no-dupe-keys': 'warn',
      // `if (x) doIt()` on one line is common in this codebase and isn't
      // worth blocking commits on.
      '@stylistic/max-statements-per-line': 'warn',
    },
  },
)
