import React, { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BottomSheetBackdrop, BottomSheetModal } from '@gorhom/bottom-sheet';
import { useInfiniteQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { BlurView } from 'expo-blur';
import Constants from 'expo-constants';
import { Image } from 'expo-image';
import { Stack, useRouter } from 'expo-router';
import _ from 'lodash';
import { ChevronLeft } from 'lucide-react-native';
import { FlatList, Platform, TouchableOpacity, View } from 'react-native';
import { init, Geolocation, Position, PositionError } from 'react-native-amap-geolocation';
import { AMapSdk, MapView, Marker } from 'react-native-amap3d';
import { request, PERMISSIONS, RESULTS, check } from 'react-native-permissions';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { amapIosApiKey, fetchMapPosts } from '@/api';
import { Avatar, AvatarFallbackText, AvatarImage } from '@/components/ui/avatar';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Divider } from '@/components/ui/divider';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import useCustomToast from '@/components/use-custom-toast';
import { largeSize, thumbnailSize } from '@/utils/file';
const appName = Constants?.expoConfig?.extra?.name || '';

const MapInfoSheet = forwardRef(function Sheet({ value = [], onChange }: any, ref: any) {
  const snapPoints = useMemo(() => ['40%', '100%'], []);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior={'close'}
      />
    ),
    [],
  );

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      enablePanDownToClose={true}
      backdropComponent={renderBackdrop}>
      <VStack className="flex-1 bg-background-100 p-4" space="md">
        <VStack className="mb-4 items-center">
          <Heading className="p-2"></Heading>
          <Divider />
        </VStack>
      </VStack>
    </BottomSheetModal>
  );
});

let mapRef: MapView;

const MapPage = () => {
  const [currentPosition, setCurrentPosition] = useState<Position>();
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const router = useRouter();
  const toast = useCustomToast();
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const insets = useSafeAreaInsets();

  const renderHeaderLeft = () => (
    <Button
      action="secondary"
      variant="link"
      onPress={() => {
        router.back();
      }}>
      <ButtonIcon as={ChevronLeft} />
      <ButtonText>返回</ButtonText>
    </Button>
  );

  const onSelectMarker = ({ item }: any) => {
    bottomSheetRef.current?.present();
  };

  const postQuery = useInfiniteQuery({
    queryKey: ['posts', 'list', 'map'],
    enabled: !!isMapLoaded,
    queryFn: fetchMapPosts,
    initialPageParam: {
      pagination: {
        page: 1,
        pageSize: 5,
      },
    },
    getNextPageParam: (lastPage: any) => {
      const {
        meta: {
          pagination: { page, pageSize, pageCount },
        },
      } = lastPage;

      if (page < pageCount) {
        return {
          pagination: { page: page + 1, pageSize },
        };
      }

      return null;
    },
  });

  const posts: any = postQuery.isSuccess
    ? _.reduce(postQuery.data?.pages, (result: any, item: any) => [...result, ...item.data], [])
    : [];

  const markers = _.map(posts, (post: any) => ({
    id: post.id,
    documentId: post.documentId,
    title: post.title,
    content: post.content,
    username: post.author.username,
    avatar: post.author.avatar,
    position: {
      latitude: post.poi?.location.split(',')[1],
      longitude: post.poi?.location.split(',')[0],
    },
  }));

  const renderItem = ({ item }: any) => {
    return (
      <TouchableOpacity onPress={() => onSelectMarker({ item })} className="h-32 w-56">
        <Image
          recyclingKey={item.id}
          source={{
            uri: largeSize(item.cover),
          }}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: 8,
          }}
        />
        <Box className="absolute top-0 w-full overflow-hidden rounded-md">
          <BlurView intensity={5} tint="light">
            <VStack space="sm" className="p-2">
              <Text size="md" bold={true} className="text-white" numberOfLines={2}>
                {item.title}
              </Text>
              <HStack space="xs" className="items-center">
                <Avatar size="xs">
                  <AvatarFallbackText>{item.author.username}</AvatarFallbackText>
                  <AvatarImage
                    source={{
                      uri: thumbnailSize(item.author.avatar),
                    }}
                  />
                </Avatar>
                <Text size="sm" className="text-white">
                  {item.author.username}
                </Text>
              </HStack>
              <Text size="xs" className="text-white">
                {format(item.createdAt, 'yyyy-MM-dd HH:mm:ss')}
              </Text>
            </VStack>
          </BlurView>
        </Box>
      </TouchableOpacity>
    );
  };

  useEffect(() => {
    const initPosition = async () => {
      await init({
        ios: amapIosApiKey as string,
        android: '',
      });

      Geolocation.getCurrentPosition(
        (position: Position) => {
          setCurrentPosition(position);
        },
        (error: PositionError) => {
          console.error(error);
        },
      );
    };

    const checkPermission = async () => {
      const status = await check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);

      if (status === RESULTS.GRANTED) {
        initPosition();
      } else if (status === RESULTS.BLOCKED) {
        toast.info({
          description: `请在 [系统设置] 里允许 ${appName} 访问您的位置。`,
        });
      } else if (status === RESULTS.DENIED) {
        const status = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);

        if (status === RESULTS.GRANTED) {
          initPosition();
        } else {
          toast.info({
            description: `请在 [系统设置] 里允许 ${appName} 访问您的位置。`,
          });
        }
      }
    };

    AMapSdk.init(
      Platform.select({
        ios: amapIosApiKey as string,
        android: '',
      }),
    );

    checkPermission();
  }, []);

  useEffect(() => {
    if (currentPosition && isMapLoaded) {
      mapRef.moveCamera({
        target: {
          latitude: currentPosition.coords.latitude,
          longitude: currentPosition.coords.longitude,
        },
      });
    }
  }, [currentPosition, isMapLoaded]);

  return (
    <>
      <Stack.Screen
        options={{
          title: '',
          headerShown: true,
          headerLeft: renderHeaderLeft,
        }}
      />
      <View className="flex-1">
        <FlatList
          style={{
            flex: 1,
            bottom: insets.bottom,
            position: 'absolute',
            zIndex: 10,
            marginHorizontal: 16,
          }}
          ItemSeparatorComponent={() => <View style={{ width: 16 }} />}
          data={posts}
          renderItem={renderItem}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
        />
        <MapView
          myLocationEnabled={true}
          indoorViewEnabled={false}
          buildingsEnabled={false}
          scaleControlsEnabled={false}
          ref={(ref: MapView) => (mapRef = ref)}
          initialCameraPosition={{
            zoom: 10,
          }}
          onLoad={() => setIsMapLoaded(true)}>
          {markers.map((marker) => {
            return (
              <Marker key={marker.documentId} position={marker.position}>
                <Avatar size="xs">
                  <AvatarFallbackText>{marker.username}</AvatarFallbackText>
                  <AvatarImage
                    source={{
                      uri: thumbnailSize(marker.avatar),
                    }}
                  />
                </Avatar>
              </Marker>
            );
          })}
        </MapView>
      </View>
      <MapInfoSheet ref={bottomSheetRef} />
    </>
  );
};

export default MapPage;
