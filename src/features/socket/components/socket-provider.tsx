import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Socket as BaseSocket, io } from 'socket.io-client';
import { useAuth } from '@/features/auth/components/auth-provider';

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
  const [socket, setSocket] = useState<Socket>();
  const { accessToken } = useAuth();

  useEffect(() => {
    if (!accessToken) return;

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

    return () => {
      client.disconnect();
    };
  }, [accessToken]);

  const value = useMemo(() => {
    return {
      socket,
    };
  }, [socket]);

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};
