module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Add additional plugins here if needed
      'react-native-reanimated/plugin',
    ],
  };
};