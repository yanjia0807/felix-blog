import EventEmitter from 'events';
import { useEffect } from 'react';

const RNEvents = new EventEmitter();

export const registerRNHandler = (action: string, callback: (payload: any) => void) => {
  RNEvents.on(action, callback);
  return () => RNEvents.off(action, callback);
};

export const useRNHandler = (action: string, callback: (payload: any) => void) => {
  useEffect(() => {
    const handler = registerRNHandler(action, callback);
    return () => handler();
  }, [action, callback]);
};

const onMessageFromRN = (message: string) => {
  const { action, payload } = JSON.parse(message);
  RNEvents.emit(action, payload);
};

// Attach the handler to `window` so we can access it from
// scripts injected by React Native WebView.
window.onMessageFromRN = onMessageFromRN;
