import { createContext, useContext, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import _ from 'lodash';
import { Socket, socket } from '@/utils/socket';
import { useAuth } from './auth-provider';

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
      setNotifications((val: any) => {
        return [data, ...val];
      });

      if (_.includes(['friendship-feedback', 'friendship-cancel'], data.type)) {
        queryClient.invalidateQueries({
          queryKey: ['users', 'detail', 'me', 'friendships'],
        });
      }
    });

    socket.on('message:create', ({ data, unreadCount }: any) => {
      setMessages((val: any) => {
        return [data, ...val];
      });

      queryClient.setQueryData(['chats', 'list'], (val: any) => {
        return {
          ...val,
          pages: val.pages.map((page: any) => ({
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
  }, [accessToken, queryClient]);

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
