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
  const socketRef = useRef<Socket | undefined>();
  const queryClient = useQueryClient();
  const [notifications, setNotifications] = useState<any>([]);
  const [messages, setMessages] = useState<any>([]);
  const { user } = useAuth();

  useEffect(() => {
    const init = async () => {
      const accessToken = await SecureStore.getItemAsync('accessToken');
      if (!accessToken) return;

      socketRef.current = io(process.env.EXPO_PUBLIC_API_SERVER as string, {
        auth: { token: accessToken },
      });
      const socket = socketRef.current as Socket;

      socket.onAny((event, ...args) => {
        console.log('socket', event, args);
      });

      socket.on('session', ({ userId }: any) => {
        if (socket) {
          socket.userId = userId;
        }
      });

      socket.on('notification:create', ({ data }: any) => {
        setNotifications((val: any) => {
          return [data, ...val];
        });
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

      socket.on('friend:add', ({ data }: any) => {
        queryClient.invalidateQueries({
          queryKey: ['users', 'detail', 'me'],
        });
        queryClient.invalidateQueries({
          queryKey: ['users', 'detail', { documentId: data.friend.documentId }],
        });
        queryClient.invalidateQueries({
          queryKey: ['friends', 'list'],
        });
        queryClient.invalidateQueries({
          queryKey: ['followings', 'list'],
        });
        queryClient.invalidateQueries({
          queryKey: ['followers', 'list'],
        });
      });

      socket.on('friend:cancel', ({ data }: any) => {
        queryClient.invalidateQueries({
          queryKey: ['users', 'detail', 'me'],
        });
        queryClient.invalidateQueries({
          queryKey: ['users', 'detail', { documentId: data.friend.documentId }],
        });
        queryClient.invalidateQueries({
          queryKey: ['friends', 'list'],
        });
        queryClient.invalidateQueries({
          queryKey: ['followings', 'list'],
        });
        queryClient.invalidateQueries({
          queryKey: ['followers', 'list'],
        });
      });

      socket.on('following:update', ({ data }: any) => {
        queryClient.invalidateQueries({
          queryKey: ['users', 'detail', 'me'],
        });
        queryClient.invalidateQueries({
          queryKey: ['users', 'detail', { documentId: data.follower.documentId }],
        });
        queryClient.invalidateQueries({
          queryKey: ['followings', 'list'],
        });
        queryClient.invalidateQueries({
          queryKey: ['followers', 'list'],
        });
      });

      socket.on('user:online', ({ data }: any) => {
        const state = queryClient.getQueryState(['friends', 'list']);

        if (state) {
          queryClient.setQueryData(['friends', 'list'], (val: any) => {
            return {
              ...val,
              pages: _.map(val.pages, (page: any) => ({
                ...page,
                data: page.data.map((item: any) =>
                  item.documentId === data.documentId ? { ...item, isOnline: '1' } : { ...item },
                ),
              })),
            };
          });
        }
      });

      socket.on('user:offline', ({ data }: any) => {
        const state = queryClient.getQueryState(['friends', 'list']);

        if (state) {
          queryClient.setQueryData(['friends', 'list'], (val: any) => {
            return {
              ...val,
              pages: _.map(val.pages, (page: any) => ({
                ...page,
                data: page.data.map((item: any) =>
                  item.documentId === data.documentId ? { ...item, isOnline: '0' } : { ...item },
                ),
              })),
            };
          });
        }
      });
    };

    const close = () => {
      if (socketRef.current?.connected) {
        socketRef.current?.close();
      }
    };

    if (!_.isNil(user)) {
      init();
    } else {
      close();
    }

    return () => {
      socketRef.current?.off('session');
      socketRef.current?.off('notification:create');
      socketRef.current?.off('message:create');
    };
  }, [user, queryClient]);

  const value = {
    messages,
    notifications,
    socket: socketRef.current as Socket,
    setNotifications,
    setMessages,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export default SocketProvider;
