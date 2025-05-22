import React, { createContext, useContext, useMemo } from 'react';
import { useRegisterExpoPushToken } from '../hooks/use-register-expo-push-token';

const PushNotificationContext = createContext<any>(undefined);

export const usePushNotification = () => {
  const context = useContext(PushNotificationContext);
  if (!context) {
    throw new Error('usePushNotification must be used within a PushNotificationProvider');
  }
  return context;
};

export const PushNotificationProvider = ({ children }: any) => {
  const { expoPushToken, setExpoPushToken } = useRegisterExpoPushToken();

  const value = useMemo(
    () => ({
      expoPushToken,
      setExpoPushToken,
    }),
    [expoPushToken, setExpoPushToken],
  );

  return (
    <PushNotificationContext.Provider value={value}>{children}</PushNotificationContext.Provider>
  );
};
