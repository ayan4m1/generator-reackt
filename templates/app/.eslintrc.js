const path = require('path');

module.exports = {
  "env": {
    "browser": true,
    "es2020": true,
    <% if (flags.addJest) { %>
    "jest": true,
    <% } %>
    "node": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:prettier/recommended",
    "plugin:jsx-a11y/recommended",
    "plugin:import/recommended",
    "plugin:react-hooks/recommended",
    <% if (flags.addJest) { %>
    "plugin:jest/recommended"
    <% } %>
  ],
  "parser": "@babel/eslint-parser",
  "parserOptions": {
    "requireConfigFile": false,
    "ecmaFeatures": {
      "jsx": true
    },
    "ecmaVersion": 12
  },
  "rules": {
    "jsx-a11y/label-has-for": 0,
    "react/jsx-uses-react": 0,
    "react/react-in-jsx-scope": 0
  },
  "settings": {
    "react": {
      "version": "detect"
    },
    "import/resolver": {
      "webpack": {
        "config": path.join(__dirname, 'webpack.config.babel.js')
      }
    }
  }
};
