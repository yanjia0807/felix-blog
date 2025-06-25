import { ConfigContext, ExpoConfig } from 'expo/config';

const IS_DEV = process.env.APP_VARIANT === 'development';
const IS_PREVIEW = process.env.APP_VARIANT === 'preview';

const getBundleId = () => {
  if (IS_DEV) {
    return 'info.yanjia.felixblog.dev';
  } else if (IS_PREVIEW) {
    return 'info.yanjia.felixblog.preview';
  }
  return 'info.yanjia.felixblog';
};

const getAppName = () => {
  if (IS_DEV) {
    return 'felix博客(dev)';
  } else if (IS_PREVIEW) {
    return 'felix博客(preview)';
  }
  return 'felix博客';
};

const getAssociatedDomains = () => {
  if (IS_DEV) {
    return ['applinks:192.168.2.5:1337'];
  } else if (IS_PREVIEW) {
    return ['applinks:felixblog.yanjia.info'];
  }
  return ['applinks:felixblog.yanjia.info'];
};

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: getAppName(),
  slug: 'felixblog',
  ios: {
    ...config.ios,
    bundleIdentifier: getBundleId(),
    associatedDomains: getAssociatedDomains(),
  },
  android: {
    ...config.android,
    package: getBundleId(),
  },
  extra: {
    ...config.extra,
    name: getAppName(),
  },
});
