import { useRef, useCallback } from 'react';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import useWebviewHTML from '../hooks/use-webview-html';

type WebEvent = {
  type: 'EDITOR_READY' | 'CONTENT_CHANGE';
  payload: string;
};

export default function CustomMap() {
  const webViewRef = useRef<WebView>(null);
  const html = useWebviewHTML();

  const handleMessage = useCallback(({ nativeEvent }: WebViewMessageEvent) => {
    try {
      const event = JSON.parse(nativeEvent.data) as WebEvent;

      switch (event.type) {
        case 'EDITOR_READY':
          console.log('Editor initialized');
          break;

        case 'CONTENT_CHANGE':
          console.log('New content:', event.payload);
          break;
      }
    } catch (error) {
      console.error('Invalid message format:', error);
    }
  }, []);

  const injectCode = useCallback((code: string) => {
    webViewRef.current?.injectJavaScript(`
      (function() {
        ${code}
        true;
      })();
    `);
  }, []);

  if (!html) return null;

  return (
    <WebView
      ref={webViewRef}
      source={{ html }}
      style={{ flex: 1 }}
      onMessage={handleMessage}
      javaScriptEnabled
      domStorageEnabled
      allowFileAccess
      mixedContentMode="compatibility"
      overScrollMode="never"
    />
  );
}
