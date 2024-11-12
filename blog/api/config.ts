import axios from 'axios';

export const baseURL = process.env.EXPO_PUBLIC_API_BASE_URL;
const config = {
  baseURL: `${baseURL}/api`,
  timeout: 300000,
  headers: {
    'Content-Type': 'application/json',
  },
};
export const client = axios.create(config);
export const publicClient = axios.create(config);

export function setClientAuth(accessToken: string | null) {
  client.interceptors.request.use(
    (config: any) => {
      if (accessToken) {
        config.headers.Authorization = 'Bearer ' + accessToken;
      } else {
        delete config.headers.Authorization;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    },
  );
  return client;
}
