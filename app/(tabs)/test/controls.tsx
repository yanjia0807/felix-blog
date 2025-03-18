import { FC, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { Text } from 'react-native';
import { init, Geolocation, Position, PositionError } from 'react-native-amap-geolocation';
import { Circle, HeatMap, LatLng, MapType, MapView, Marker } from 'react-native-amap3d';
import { AMapSdk } from 'react-native-amap3d';
import { SafeAreaView } from 'react-native-safe-area-context';
import { amapIosApiKey } from '@/api';
import { useAuth } from '@/components/auth-context';
import { HStack } from '@/components/ui/hstack';
import { thumbnailSize } from '@/utils/file';
let mapView: MapView;
const Controls: FC = () => {
  const { user } = useAuth();
  const mapRef = useRef<any>();
  const [markers, setMarkers] = useState(Array<LatLng>());

  const [position, setPosition] = useState<Position | null>(null);
  useEffect(() => {
    AMapSdk.init(amapIosApiKey as string);

    const initPosition = async () => {
      await init({
        ios: amapIosApiKey as string,
        android: '',
      });

      Geolocation.getCurrentPosition(
        (position: Position) => {
          setPosition(position);
        },
        (error: PositionError) => {
          console.error(error);
        },
      );
    };
    AMapSdk.init(amapIosApiKey as string);
    initPosition();
  }, []);

  const initialCameraPosition: any = { zoom: 1 };
  if (position) {
    mapRef.current = {
      target: {
        latitude: position?.coords?.latitude,
        longitude: position?.coords?.longitude,
      },
    };
  }

  const coordinates = new Array(200).fill(0).map(() => ({
    latitude: 39.5 + Math.random(),
    longitude: 116 + Math.random(),
  }));

  return (
    <MapView
      ref={(ref: MapView) => (mapView = ref)}
      style={{ flex: 1 }}
      mapType={MapType.Satellite}
      initialCameraPosition={initialCameraPosition}
      myLocationEnabled={true}
      labelsEnabled={true}
      trafficEnabled={false}
      myLocationButtonEnabled={true}
      zoomControlsEnabled={true}
      scaleControlsEnabled={true}
      buildingsEnabled={true}
      indoorViewEnabled={true}
      tiltGesturesEnabled={true}
      rotateGesturesEnabled={true}
      scrollGesturesEnabled={true}
      zoomGesturesEnabled={true}
      onLoad={(event) => {
        console.log('@@,onLoad', event);
      }}
      // onPress={(event) => {
      //   // mapView?.moveCamera(
      //   //   {
      //   //     tilt: 45,
      //   //     bearing: 90,
      //   //     zoom: 18,
      //   //     target: { latitude: 39.97837, longitude: 116.31363 },
      //   //   },
      //   //   1000,
      //   // );
      //   // console.log('@@,onPress', mapRef.current);
      // }}
      onPress={({ nativeEvent }) => {
        setMarkers([...markers, nativeEvent]);
      }}
      onLocation={(event) => {
        console.log('@@,onLocation', mapRef.current);
      }}>
      {markers.map((position) => (
        <Marker
          key={`${position.latitude},${position.longitude}`}
          icon={{ uri: thumbnailSize(user.avatar), height: 20, width: 20 }}
          position={position}
          onPress={() => {
            markers.splice(markers.indexOf(position), 1);
            setMarkers([...markers]);
          }}
        />
      ))}
      <HeatMap opacity={0.8} radius={20} data={coordinates} />
      <Circle
        strokeWidth={5}
        strokeColor="rgba(0, 0, 255, 0.5)"
        fillColor="rgba(255, 0, 0, 0.5)"
        radius={10000}
        center={{ latitude: 39.906901, longitude: 116.397972 }}
      />
      {position && (
        <Marker
          key={`${position.coords.latitude},${position.coords.longitude}`}
          icon={{ uri: thumbnailSize(user.avatar), height: 20, width: 20 }}
          position={{
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }}
        />
      )}
    </MapView>
  );
};

export default Controls;
