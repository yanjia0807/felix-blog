import axios, { isAxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';

const apiServerURL = process.env.EXPO_PUBLIC_API_SERVER;

const config = {
  baseURL: `${apiServerURL}/api`,
  timeout: 300000,
};

const apiClient = axios.create(config);

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
    console.error('[api request error]', error);
    return Promise.reject(error);
  },
);

apiClient.interceptors.response.use(
  (response) => {
    console.log(
      `[api ${response.status}] ${response.config.method?.toUpperCase()} ${response.config.url} - headers: ${response.config.headers} - params: ${response.config.params} - data: ${response.config.data} `,
    );
    return response.data;
  },
  async (error: Error) => {
    if (isAxiosError(error)) {
      console.error(
        `[api error ${error.response?.status}] ${error.response?.config.method?.toUpperCase()} ${error.response?.config.url}`,
        error.response?.data.error || error,
      );
      return Promise.reject(error.response?.data.error || error);
    } else {
      console.error('[api error]', error);
      return Promise.reject(error);
    }
  },
);

export { apiClient };
