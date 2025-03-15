import { ConfigContext, ExpoConfig } from 'expo/config';

const IS_DEV = process.env.APP_VARIANT === 'development';
const IS_PREVIEW = process.env.APP_VARIANT === 'preview';

const getBundleId = () => {
  console.log("getBundleId", IS_DEV, IS_PREVIEW)
  if (IS_DEV) {
    return 'info.yanjia.felixblog.dev';
  }
  if (IS_PREVIEW) {
    return 'info.yanjia.felixblog.preview';
  }
  return 'info.yanjia.felixblog';
};

const getAppName = () => {
  if (IS_DEV) {
    return 'felix博客 (dev)';
  }
  if (IS_PREVIEW) {
    return 'felix博客 (preview)';
  }
  return 'felix博客';
};

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: getAppName(),
  slug: 'felix-blog',
  ios: {
    ...config.ios,
    bundleIdentifier: getBundleId(),
  },
  android: {
    ...config.android,
    package: getBundleId(),
  },
});
