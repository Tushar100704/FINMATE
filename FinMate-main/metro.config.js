const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Increase timeout for slow connections
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      // Increase timeout to 5 minutes
      res.setTimeout(300000);
      return middleware(req, res, next);
    };
  },
};

// Reset cache on start
config.resetCache = true;

module.exports = config;
