module.exports = {
  parserOptions: {
    ecmaVersion: 8,
  },
  env: {
    browser: false,
    node: true,
  },
  extends: ['airbnb-base'],
  rules: {
    'max-len': ['warn', { code: 130, ignoreUrls: true }],
    indent: ['error', 2],
    curly: ['warn', 'multi', 'consistent'],
    'no-multi-spaces': ['error', { ignoreEOLComments: true }],
    'space-before-function-paren': ['error', { anonymous: 'always', named: 'never' }],
    'padded-blocks': 'off',
    'import/prefer-default-export': 'off',
    'arrow-parens': ['warn', 'as-needed'],
    'prefer-arrow-callback': ['error', { allowNamedFunctions: true }],
    'prefer-template': 'off',
    'no-plusplus': 'off',
    'one-var': 'off',
    'one-var-declaration-per-line': 'off',
    'object-property-newline': 'off',
    'function-paren-newline': 'off',
    'quote-props': ['warn', 'consistent-as-needed'],
  },
};
