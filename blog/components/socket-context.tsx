import { useQueryClient } from '@tanstack/react-query';
import _ from 'lodash';
import { createContext, useContext, useEffect, useState } from 'react';
import { Socket, socket } from '@/utils/socket';
import { useAuth } from './auth-context';

type SocketContextType = {
  socket: Socket;
  notifications: any[];
  setNotifications: any;
  messages: any[];
  setMessages: any;
};

const SocketContext = createContext<SocketContextType>({
  socket,
  notifications: [],
  setNotifications: () => {},
  messages: [],
  setMessages: () => {},
});

export const useSocket = () => useContext(SocketContext);

const SocketProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  const [notifications, setNotifications] = useState<any>([]);
  const [messages, setMessages] = useState<any>([]);

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

    socket.on('notification:create', ({ data }: any) => {
      setNotifications((oldData: any) => {
        return [data, ...oldData];
      });
    });

    socket.on('message:create', ({ data, unreadCount }: any) => {
      setMessages((oldData: any) => {
        return [data, ...oldData];
      });

      queryClient.setQueryData(['chats', 'list'], (oldData: any) => {
        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            data: page.data.map((item: any) =>
              item.id === data.chat.id
                ? {
                    ...item,
                    chatStatuses: [
                      {
                        ...item.chatStatuses[0],
                        unreadCount,
                      },
                    ],
                  }
                : { ...item },
            ),
          })),
        };
      });
    });

    return () => {
      socket.off('session');
      socket.off('notification:create');
      socket.off('message:create');
    };
  }, [accessToken]);

  const value = {
    messages,
    notifications,
    socket,
    setNotifications,
    setMessages,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export default SocketProvider;
