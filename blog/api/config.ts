import axios from 'axios';

export const baseURL = process.env.EXPO_PUBLIC_API_BASE_URL;
const config = {
  baseURL: `${baseURL}/api`,
  timeout: 300000,
  headers: {
    'Content-Type': 'application/json',
  },
};
 const client = axios.create(config);

 function setClientAuthHeader(accessToken: string | null) {
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

 export { client, setClientAuthHeader };
 export { axios };
