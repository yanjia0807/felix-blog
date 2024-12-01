import { useInfiniteQuery } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import _ from 'lodash';
import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, SafeAreaView, View } from 'react-native';
import {
  init,
  Geolocation,
  setLocatingWithReGeocode,
  addLocationListener,
  start,
  stop,
  setInterval,
  setDistanceFilter,
  Position,
  PositionError,
} from 'react-native-amap-geolocation';
import { MapView, Marker } from 'react-native-amap3d';
import { apiServerURL } from '@/api';
import { fetchPositionRound } from '@/api/amap';
import { useAuth } from '@/components/auth-context';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Text } from '@/components/ui/text';

const UserMarker = ({ coordinate }: any) => {
  const { user } = useAuth();
  return (
    <Marker
      position={{
        latitude: 29.468108452690974,
        longitude: 106.53686740451388,
      }}>
      <Avatar size="sm">
        <AvatarImage
          source={{
            uri: `${apiServerURL}/${user?.profile?.avatar?.formats.thumbnail.url}`,
          }}
        />
      </Avatar>
    </Marker>
  );
};

const MapHome = () => {
  const [position, setPosition] = useState<Position | null>(null);
  const [places, setPlaces] = useState([]);

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetchingNextPage,
    status,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['position'],
    queryFn: fetchPositionRound,
    initialPageParam: {
      location: `${position?.coords.latitude},${position?.coords.longitude}`,
      page_num: 1,
      page_size: 20,
    },
    getNextPageParam: (lastPage: any, queryData: any) => {
      if (lastPage.count === queryData['page_size']) {
        return {
          location: queryData.location,
          page_num: queryData['page_num'] + 1,
          page_size: queryData['page_size'],
        };
      }

      return null;
    },
  });

  useEffect(() => {
    const initLocation = async () => {
      await init({
        ios: process.env['EXPO_PUBLIC_AMAP_IOS_KEY'] as string,
        android: '',
      });

      Geolocation.getCurrentPosition(
        (position: Position) => {
          console.log('position', position);
          setPosition(position);
        },
        (error: PositionError) => {
          console.error(error);
        },
      );
    };

    initLocation();
  }, []);

  const initialCameraPosition = useMemo(() => {
    return position
      ? {
          initialCameraPosition: {
            target: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            },
            zoom: 11,
          },
        }
      : { zoom: 11 };
  }, [position]);

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
        }}
      />

      <SafeAreaView className="flex-1">
        <MapView
          onPress={({ nativeEvent }) => console.log('onPress', nativeEvent)}
          onCameraIdle={({ nativeEvent }) => console.log('onCameraIdle', nativeEvent)}
          onLocation={({ nativeEvent }) => console.log('onLocation', nativeEvent)}
          compassEnabled={false}
          myLocationEnabled={true}
          {...initialCameraPosition}>
          <UserMarker coordinate={position} />
        </MapView>
        {position ? (
          <Text className="text-base font-bold">
            当前位置：{`${position.coords.latitude}, ${position.coords.longitude}`}
          </Text>
        ) : (
          <Text className="text-base text-gray-500">正在获取当前位置...</Text>
        )}
        <FlatList
          data={places}
          keyExtractor={(item: any) => item.id}
          renderItem={({ item }) => (
            <View className="p-2 border-b border-gray-300">
              <Text className="text-lg font-semibold">{item.name}</Text>
              <Text className="text-sm text-gray-500">{item.address}</Text>
            </View>
          )}
        />
      </SafeAreaView>
    </>
  );
};

export default MapHome;
