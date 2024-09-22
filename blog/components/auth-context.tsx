import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation } from "@tanstack/react-query";
import { createContext, useContext, useEffect, useState } from "react";
import client from "~/api/client";
import { register, login } from "~/api/user";

export const TOKEN_KEY = "my-jwt";
export const USER_KEY = "my-user";

const AuthContext = createContext<any>({});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }: any) => {
  const [authState, setAuthState] = useState<any>({
    token: null,
    authenticated: null,
  });

  useEffect(() => {
    const loadToken = async () => {
      const jwt = await AsyncStorage.getItem(TOKEN_KEY);
      if (jwt) {
        setAuthState({
          token: jwt,
          authenticated: true,
        });
        client.defaults.headers.common["Authorization"] = `Bearer ${jwt}`;
      }
    };
    loadToken();
  }, []);

  const setLoginStatus = async ({ jwt, user }: any) => {
    setAuthState({
      token: jwt,
      authenticated: true,
    });
    client.defaults.headers.common["Authorization"] = `Bearer ${jwt}`;

    await AsyncStorage.setItem(TOKEN_KEY, jwt);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  };

  const clearLoginStatus = async () => {
    setAuthState({
      token: null,
      authenticated: false,
    });
    client.defaults.headers.common["Authorization"] = "";
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(USER_KEY);
  };

  const onRegister = () => {
    const mutation = useMutation({
      mutationFn: async (data: any) => {
        const res = await register(data);
        const { jwt, user } = res;
        setLoginStatus({ jwt, user });
        return res;
      },
    });

    return mutation;
  };

  const onLogin = () => {
    const mutation = useMutation({
      mutationFn: async (data: any) => {
        const res = await login(data);
        const { jwt, user } = res;
        setLoginStatus({ jwt, user });
        return res;
      },
    });

    return mutation;
  };

  const onLogout = () => {
    clearLoginStatus();
  };

  const value = {
    authState,
    onRegister,
    onLogin,
    onLogout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
