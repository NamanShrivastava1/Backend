import eslintPluginImport from 'eslint-plugin-import';
import prettier from 'eslint-config-prettier';

export default [
  prettier, // disables ESLint rules that conflict with Prettier

  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        process: 'readonly',
        __dirname: 'readonly',
      },
    },

    plugins: {
      import: eslintPluginImport,
    },

    rules: {
      // 🔹 Basic quality
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',

      // 🔹 Import rules
      'import/order': [
        'warn',
        {
          groups: ['builtin', 'external', 'internal'],
          'newlines-between': 'always',
        },
      ],
      'import/no-unresolved': 'error',

      // 🔹 Clean code style
      'prefer-const': 'warn',
      'no-var': 'error',
    },
  },
];
