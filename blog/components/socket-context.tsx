import { createContext, useContext, useEffect } from 'react';
import { Socket, socket } from '@/utils/socket';
import { useAuth } from './auth-context';

type SocketContextType = {
  socket: Socket;
};

const SocketContext = createContext<SocketContextType>({
  socket,
});

export const useSocket = () => useContext(SocketContext);

const SocketProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { accessToken } = useAuth();

  useEffect(() => {
    const setSocket = async () => {
      if (accessToken) {
        socket.auth = { token: accessToken };
        socket.connect();
      }
    };

    setSocket();

    socket.onAny((event, ...args) => {
      console.log('socket', event, args);
    });

    socket.on('session', ({ userId }) => {
      socket.userId = userId;
    });

    socket.on('connect_error', (err) => {
      console.error('socket err', err);
    });

    return () => {
      if (socket.connected) {
        socket.disconnect();
      }
      socket.off('session');
      socket.off('connect_error');
    };
  }, [accessToken]);

  const value = {
    socket,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export default SocketProvider;
