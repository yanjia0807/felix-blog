import { createContext, useContext, useEffect, RefObject } from 'react';
import WebView from 'react-native-webview';

type MessagePayload = any;
type MessageHandler = (payload: MessagePayload) => void;
type MessageAction = string;

interface WebViewMessage {
  action: MessageAction;
  payload?: MessagePayload;
}

const WebViewContext = createContext<{
  sendToRN: (action: MessageAction, payload?: MessagePayload) => void;
  registerHandler: (action: MessageAction, handler: MessageHandler) => () => void;
} | null>(null);

export const useWebView = () => {
  const context = useContext(WebViewContext);
  if (!context) throw new Error('useWebView must be used within WebViewProvider');
  return context;
};

export const postMessageToWebApp = (
  webViewRef: RefObject<WebView>,
  action: MessageAction,
  payload?: MessagePayload,
) => {
  const message: WebViewMessage = { action, payload };
  const script = `
      (function() {
        const event = new CustomEvent('messageFromRN', { 
          detail: ${JSON.stringify(JSON.stringify(message))}
        });
        window.dispatchEvent(event);
      })();
    `;
  webViewRef.current?.injectJavaScript(script);
};

export const WebViewProvider = ({ children }: { children: React.ReactNode }) => {
  const sendToRN = (action: MessageAction, payload?: MessagePayload) => {
    if (!window.ReactNativeWebView) {
      console.warn('ReactNativeWebView is not defined');
      return;
    }
    window.ReactNativeWebView.postMessage(JSON.stringify({ action, payload }));
  };

  const registerHandler = (action: MessageAction, handler: MessageHandler) => {
    const listener = (e: Event) => {
      try {
        const { action: receivedAction, payload } = JSON.parse((e as CustomEvent).detail);
        if (receivedAction === action) handler(payload);
      } catch (err) {
        console.error('Failed to parse RN message:', err);
      }
    };

    window.addEventListener('messageFromRN', listener);
    return () => window.removeEventListener('messageFromRN', listener);
  };

  return (
    <WebViewContext.Provider value={{ sendToRN, registerHandler }}>
      {children}
    </WebViewContext.Provider>
  );
};

export const getWebViewInitializationScript = () => `
  window.ReactNativeWebView = window.ReactNativeWebView || window;
  true; // 防止 Android 下报错
`;
