module.exports = {
  extends: "airbnb",
  plugins: [],
  rules: {
    "prefer-rest-params": "off",
    "prefer-spread": "off",
    "function-paren-newline": "off",
    "comma-dangle": [
      "error",
      {
        objects: "always-multiline",
        functions: "never"
      }
    ]
  }
};
