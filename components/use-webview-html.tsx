import { useEffect, useState } from 'react';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';

async function loadLocalHTML(): Promise<string> {
  const [{ localUri }] = await Asset.loadAsync(require('../../assets/webviews/index.html'));

  if (!localUri) {
    throw new Error('Webview HTML asset not found');
  }

  return FileSystem.readAsStringAsync(localUri);
}

export default function useWebviewHTML() {
  const [html, setHtml] = useState<string>();

  useEffect(() => {
    let isMounted = true;

    loadLocalHTML()
      .then((content) => isMounted && setHtml(content))
      .catch(console.error);

    return () => {
      isMounted = false;
    };
  }, []);

  return html;
}
