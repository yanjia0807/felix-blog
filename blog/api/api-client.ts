import axios from 'axios';

export const apiServerURL = process.env.EXPO_PUBLIC_API_SERVER_URL;

const config = {
  baseURL: `${apiServerURL}/api`,
  timeout: 300000,
  headers: {
    'Content-Type': 'application/json',
    'access-control-allow-origin': '*',
  },
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

apiClient.interceptors.response.use(
  (response) => {
    console.log(
      `[api response] ${response.config.method?.toUpperCase()} ${response.config.url} - status: ${response.status}`,
      {
        data: response.data,
        headers: response.headers,
      },
    );
    return response.data;
  },
  (error: Error) => {
    if (axios.isAxiosError(error)) {
      console.error(`[api axios error]`, error.response?.data.error || error);
      return Promise.reject(error.response?.data.error || error);
    } else {
      console.error('[api error]', error.message);
      return Promise.reject(error);
    }
  },
);

function setAuthHeader(accessToken: string | null) {
  apiClient.interceptors.request.use(
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
}

export { apiClient, setAuthHeader };
