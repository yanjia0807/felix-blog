import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';
import _ from 'lodash';
import { Socket as BaseSocket, io } from 'socket.io-client';
import { useAuth } from './auth-provider';

interface Socket extends BaseSocket {
  userId?: string;
}

type SocketContextType = {
  socket: Socket | undefined;
  notifications: any[];
  setNotifications: any;
  messages: any[];
  setMessages: any;
};

const SocketContext = createContext<SocketContextType>({
  socket: undefined,
  notifications: [],
  setNotifications: () => {},
  messages: [],
  setMessages: () => {},
});

export const useSocket = () => useContext(SocketContext);

const SocketProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const socket = useRef<Socket | undefined>();
  const queryClient = useQueryClient();
  const [notifications, setNotifications] = useState<any>([]);
  const [messages, setMessages] = useState<any>([]);
  const { isLogin } = useAuth();

  useEffect(() => {
    const init = async () => {
      const accessToken = await SecureStore.getItemAsync('accessToken');
      if (!accessToken) return;

      socket.current = io(process.env.EXPO_PUBLIC_API_SERVER as string, {
        auth: { token: accessToken },
      });

      socket.current.onAny((event, ...args) => {
        console.log('socket', event, args);
      });

      socket.current.on('session', ({ userId }: any) => {
        if (socket.current) {
          socket.current.userId = userId;
        }
      });

      socket.current.on('notification:create', ({ data }: any) => {
        setNotifications((val: any) => {
          return [data, ...val];
        });

        if (_.includes(['friendship-feedback', 'friendship-cancel'], data.type)) {
          queryClient.invalidateQueries({
            queryKey: ['users', 'detail', 'me', 'friendships'],
          });
        }
      });

      socket.current.on('message:create', ({ data, unreadCount }: any) => {
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

      socket.current.emit('user:online:add', socket.current.userId);
    };

    const close = () => {
      if (socket.current?.connected) {
        socket.current?.close();
      }
    };

    if (isLogin) {
      init();
    } else {
      close();
    }

    return () => {
      socket.current?.off('session');
      socket.current?.off('notification:create');
      socket.current?.off('message:create');
    };
  }, [isLogin]);

  const value = {
    messages,
    notifications,
    socket: socket.current,
    setNotifications,
    setMessages,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export default SocketProvider;
