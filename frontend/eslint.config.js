// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', 'ios/*', 'android/*'],
  },
  {
    rules: {
      // RN の旧 Animated API（useRef(new Animated.ValueXY()).current + interpolate）
      // が誤検知されるため warn に下げる
      'react-hooks/refs': 'warn',
    },
  },
]);
