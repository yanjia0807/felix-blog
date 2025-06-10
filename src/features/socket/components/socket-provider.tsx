import { useAuth } from '@/features/auth/components/auth-provider';
import { useQueryClient } from '@tanstack/react-query';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
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
  const [socket, setSocket] = useState<Socket>();
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!accessToken) return;

    const client = io(process.env.EXPO_PUBLIC_API_SERVER as string, {
      auth: { token: accessToken },
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

    client?.on('message', ({ data }) => {
      console.log('socket event: message', data);

      const chatDocumentId = data.chat.documentId;

      queryClient.invalidateQueries({
        queryKey: ['chats', 'detail', { documentId: chatDocumentId }],
      });
      queryClient.invalidateQueries({
        queryKey: ['chats', 'unread-count'],
      });

      queryClient.invalidateQueries({ queryKey: ['chats', 'list'] });
      queryClient.invalidateQueries({
        queryKey: ['messsages', 'list', { chatDocumentId }],
      });
    });

    client?.on('notification', ({ data }) => {
      console.log('socket event: notification', data);

      queryClient.invalidateQueries({ queryKey: ['notifications', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'count'] });
    });

    client.on('addFriend', ({ data }: any) => {
      console.log('socket event: addFriend', data);

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

    client.on('cancelFriend', ({ data }: any) => {
      console.log('socket event: cancelFriend', data);

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

    client.on('updateFollowing', ({ data }: any) => {
      console.log('socket event: updateFollowing', data);

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

    client.on('userStatus', ({ data }: any) => {
      console.log('socket event: updateFollowing', data);

      queryClient.invalidateQueries({
        queryKey: ['users', 'detail', 'me'],
      });
      queryClient.invalidateQueries({
        queryKey: ['chats', 'list'],
      });
      queryClient.invalidateQueries({
        queryKey: ['chats', 'detail'],
      });
      queryClient.invalidateQueries({
        queryKey: ['followings', 'list'],
      });
      queryClient.invalidateQueries({
        queryKey: ['followers', 'list'],
      });
    });

    setSocket(client);

    return () => {
      client.disconnect();
    };
  }, [accessToken, queryClient]);

  const value = useMemo(() => {
    return {
      socket,
    };
  }, [socket]);

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};
