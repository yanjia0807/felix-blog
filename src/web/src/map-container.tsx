import React, { useEffect } from 'react';
import AMapLoader from '@amap/amap-jsapi-loader';
import '@amap/amap-jsapi-types';
import { useWebView } from '../../components/web-view';

function MapContainer() {
  const mapRef = React.useRef<AMap.Map | null>(null);
  const { sendToRN, registerHandler } = useWebView();

  useEffect(() => {
    const loadMap = async () => {
      const AMap = await AMapLoader.load({
        key: import.meta.env.VITE_AMAP_JS_KEY,
        version: '2.0',
        plugins: ['AMap.ToolBar', 'AMap.Scale', 'AMap.MapType'],
      });

      mapRef.current = new AMap.Map('container', {
        viewMode: '2D',
        zoom: 17,
      });

      mapRef.current?.on('complete', function () {
        sendToRN('mapComplete', { status: 'success' });
      });

      mapRef.current?.on('moveend', function () {
        sendToRN('boundsChange', { bounds: mapRef.current?.getBounds() });
      });

      mapRef.current?.on('zoomend', function () {
        sendToRN('boundsChange', { bounds: mapRef.current?.getBounds() });
      });
    };

    const cleanListener = registerHandler('setParams', (payload) => {
      mapRef.current?.setCenter([payload.longitude, payload.latitude]);
      mapRef.current?.setMapStyle(
        payload.theme === 'light' ? 'amap://styles/whitesmoke' : 'amap://styles/dark',
      );
    });

    loadMap();

    return () => {
      mapRef.current?.destroy();
      mapRef.current = null;
      cleanListener();
    };
  }, []);

  return <div id="container" className="h-full"></div>;
}

export default MapContainer;
