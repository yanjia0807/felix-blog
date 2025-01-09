import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

export const apiServerURL = process.env.EXPO_PUBLIC_API_SERVER_URL;

const config = {
  baseURL: `${apiServerURL}/api`,
  timeout: 300000,
};

const apiClient = axios.create(config);

apiClient.interceptors.request.use(
  (config) => {
    console.log(`[api request] ${config.method?.toUpperCase()} ${config.url}`, {
      headers: config.headers,
      params: config.params,
      data: config.data,
    });
    return config;
  },
  (error) => {
    console.error('[api request error]', error);
    return Promise.reject(error);
  },
);

apiClient.interceptors.request.use(
  async (config: any) => {
    const accessToken = await SecureStore.getItemAsync('accessToken');
    if (accessToken) {
      config.headers.Authorization = 'Bearer ' + accessToken;
    } else {
      delete config.headers.Authorization;
    }
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  },
);

apiClient.interceptors.response.use(
  (response) => {
    console.log(
      `[api response] ${response.config.method?.toUpperCase()} ${response.config.url} - status: ${response.status}`,
      {
        data: response.data,
      },
    );
    return response.data;
  },
  (error: Error) => {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.error(
          `[api error] ${error.response.config.method?.toUpperCase()} ${error.response.config.url} - status: ${error.response.status}`,
          error.response?.data.error || error,
        );
        return Promise.reject(error.response?.data.error || error);
      } else {
        console.error('[api error]', error);
        return Promise.reject(error);
      }
    } else {
      console.error('[api error]', error);
      return Promise.reject(error);
    }
  },
);

export { apiClient };
