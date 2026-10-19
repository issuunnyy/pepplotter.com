const path = require('path');

module.exports = {
  plugins: {
    [path.resolve(__dirname, 'scripts/tailwind-v4-plugin.js')]: {},
  },
};
