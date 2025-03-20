module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Only add the following if you're using Expo Router
      'expo-router/babel',
    ],
  };
};