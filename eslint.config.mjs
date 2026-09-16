import js from '@eslint/js';

export default [
  {
    ignores: ['node_modules/**', 'dist/**', 'coverage/**', 'src/generated/**'],
  },
  js.configs.recommended,
  {
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
    },
  },
];
