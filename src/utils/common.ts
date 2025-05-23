import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as SecureStore from 'expo-secure-store';
import _ from 'lodash';

export const getDeviceId = async () => {
  let deviceId = await SecureStore.getItemAsync('deviceId');

  if (_.isNil(deviceId)) {
    deviceId = `${Device.modelName}-${Date.now()}`;
    await SecureStore.setItemAsync('deviceId', deviceId);
  }
  return deviceId;
};

export const getProjectId = () => {
  const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
  if (_.isNil(projectId)) {
    console.error('project id not found');
    return;
  }
  return projectId;
};
