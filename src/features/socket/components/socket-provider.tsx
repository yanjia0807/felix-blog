import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Socket as BaseSocket, io } from 'socket.io-client';

interface Socket extends BaseSocket {
  userId?: string;
}

const SocketContext = createContext<any>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }: any) => {
  useEffect(() => console.log('@render SocketProvider'));
  const [socket, setSocket] = useState<Socket>();

  useEffect(() => {
    const initSocket = async () => {
      const accessToken = await SecureStore.getItemAsync('accessToken');

      if (accessToken) {
        const client = io(process.env.EXPO_PUBLIC_API_SERVER as string, {
          auth: { token: accessToken },
        });

        client.onAny((event, ...args) => {
          console.log('socket', event, args);
        });

        client.on('connect', () => {
          console.log('socket connect');
        });

        client.on('disconnect', () => {
          console.log('socket disconnected');
        });

        client.on('connect_error', (err) => {
          console.error('socket connection Error:', err);
        });

        setSocket(client);
      }
    };

    initSocket();

    return () => {
      socket?.disconnect();
    };
  }, []);

  const value = useMemo(() => {
    return {
      socket,
    };
  }, [socket]);

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};
