const { create, getDefaultConfig } = require("../..");

module.exports = create(jestConfig => {
  const baseConfig = getDefaultConfig(jestConfig);
  baseConfig.aliasFields = ["custom-alias"];
  return baseConfig;
});
