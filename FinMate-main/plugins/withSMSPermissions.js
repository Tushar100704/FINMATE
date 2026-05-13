const { withAndroidManifest } = require('@expo/config-plugins');

/**
 * Config plugin to add SMS permissions to AndroidManifest.xml
 */
const withSMSPermissions = (config) => {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults.manifest;

    // Add SMS permissions
    if (!androidManifest['uses-permission']) {
      androidManifest['uses-permission'] = [];
    }

    const permissions = [
      'android.permission.READ_SMS',
      'android.permission.RECEIVE_SMS',
      'android.permission.READ_CONTACTS',
    ];

    permissions.forEach((permission) => {
      if (
        !androidManifest['uses-permission'].find(
          (item) => item.$['android:name'] === permission
        )
      ) {
        androidManifest['uses-permission'].push({
          $: {
            'android:name': permission,
          },
        });
      }
    });

    return config;
  });
};

module.exports = withSMSPermissions;
