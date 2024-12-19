import { createContext, useContext, useEffect, useMemo } from 'react';
import { Socket, io } from 'socket.io-client';
import { useAuth } from './auth-context';

type SocketContextType = {
  socket: Socket | null;
};

const SocketContext = createContext<SocketContextType>({
  socket: null,
});

export const useSocket = () => useContext(SocketContext);

const SocketProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { accessToken } = useAuth();

  const socket = useMemo(() => {
    if (accessToken) {
      return io(process.env.EXPO_PUBLIC_API_SERVER_URL as string, {
        withCredentials: true,
        auth: { accessToken: accessToken },
      });
    }
    return null;
  }, [accessToken]);

  useEffect(() => {
    return () => {
      socket?.disconnect();
    };
  }, [socket]);

  return <SocketContext.Provider value={{ socket }}>{children}</SocketContext.Provider>;
};

export default SocketProvider;
