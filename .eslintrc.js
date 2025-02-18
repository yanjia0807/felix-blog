// https://docs.expo.dev/guides/using-eslint/
module.exports = {
  extends: ['expo', 'prettier'],
  ignorePatterns: ['/dist/*'],
  rules: {
    'react/display-name': 'off',
  },
};
