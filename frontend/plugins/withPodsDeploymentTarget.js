// Xcode 27 は iOS 15.0 未満の IPHONEOS_DEPLOYMENT_TARGET をエラーにするため、
// Pods 側のターゲット（例: RNCAsyncStorage の resource bundle = 13.4）をアプリの最低iOSまで引き上げる。
const fs = require('fs');
const path = require('path');
const { withDangerousMod } = require('expo/config-plugins');

const MARKER = '# @generated withPodsDeploymentTarget';

const snippet = `
    ${MARKER}
    min_ios = podfile_properties['ios.deploymentTarget'] || '15.1'
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |build_config|
        current = build_config.build_settings['IPHONEOS_DEPLOYMENT_TARGET']
        if current.nil? || Gem::Version.new(current) < Gem::Version.new(min_ios)
          build_config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = min_ios
        end
      end
    end`;

module.exports = function withPodsDeploymentTarget(config) {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const podfilePath = path.join(config.modRequest.platformProjectRoot, 'Podfile');
      let podfile = fs.readFileSync(podfilePath, 'utf8');
      if (!podfile.includes(MARKER)) {
        podfile = podfile.replace(/(react_native_post_install\([\s\S]*?\n\s*\))/, `$1\n${snippet}`);
        fs.writeFileSync(podfilePath, podfile);
      }
      return config;
    },
  ]);
};
