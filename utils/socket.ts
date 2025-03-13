import { Socket as BaseSocket, io } from 'socket.io-client';

export interface Socket extends BaseSocket {
  userId?: string;
}

export const socket: Socket = io(process.env.EXPO_PUBLIC_API_SERVER as string, {
  autoConnect: false,
});
