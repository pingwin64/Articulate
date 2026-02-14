const { withAppDelegate } = require("@expo/config-plugins");

module.exports = function withMetroPort(config, port) {
  return withAppDelegate(config, (config) => {
    let contents = config.modResults.contents;
    contents = contents.replace(
      'return RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: ".expo/.virtual-metro-entry")',
      `UserDefaults.standard.set(${port}, forKey: "RCT_METRO_PORT")\n    return RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: ".expo/.virtual-metro-entry")`
    );
    config.modResults.contents = contents;
    return config;
  });
};
