const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withDisableScreenCaptureSecurity(config) {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults.manifest;

    // Remove FLAG_SECURE from all activities
    if (androidManifest.application && androidManifest.application[0].activity) {
      androidManifest.application[0].activity.forEach((activity) => {
        if (!activity.$) {
          activity.$ = {};
        }
        // Allow screen capture
        activity.$['android:screenOrientation'] = 'portrait';
      });
    }

    return config;
  });
};
