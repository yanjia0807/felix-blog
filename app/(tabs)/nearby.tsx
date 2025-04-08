import React, { forwardRef, useEffect, useMemo, useRef } from 'react';
import BottomSheet from '@gorhom/bottom-sheet';
import { useInfiniteQuery } from '@tanstack/react-query';
import _ from 'lodash';
import { LocateIcon } from 'lucide-react-native';
import { View } from 'react-native';
import { Position } from 'react-native-amap-geolocation';
import { FlatList } from 'react-native-gesture-handler';
import { WebView } from 'react-native-webview';
import { fetchFriends, fetchNearbyPosts } from '@/api';
import { MainHeader } from '@/components/header';
import PageSpinner from '@/components/page-spinner';
import { usePreferences } from '@/components/preferences-provider';
import { Card } from '@/components/ui/card';
import { Fab, FabIcon } from '@/components/ui/fab';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import usePosition from '@/components/use-position';
import { getWebViewInitializationScript, postMessageToWebApp } from '@/components/web-view';

const NearbyHeader: React.FC<any> = () => {
  return <MainHeader className="mb-[17.5] px-4" />;
};

const NearbyBottomSheet: React.FC<any> = forwardRef(function Sheet(props: any, ref: any) {
  const snapPoints = useMemo(() => [168], []);
  const [index, setIndex] = React.useState(-1);
  const postQuery = useInfiniteQuery({
    queryKey: ['posts', 'list'],
    queryFn: fetchNearbyPosts,
    initialPageParam: {
      pagination: {
        page: 1,
        pageSize: 20,
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

  const renderListItem = ({ item, index }: any) => {
    return <Card className={`mx-2 h-40 w-52 ${index === 0 ? 'ml-0' : ''} `} size="sm"></Card>;
  };

  const renderEmptyComponent = () => {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>暂无数据</Text>
      </View>
    );
  };

  const onSheetChange = async (_index: number) => {
    console.log('onSheetChange', _index);
    setIndex(_index);
  };

  return (
    <BottomSheet
      ref={ref}
      index={index}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      enablePanDownToClose={true}
      onChange={onSheetChange}>
      <VStack className="bg-background-50 p-4">
        <FlatList
          data={posts}
          renderItem={renderListItem}
          ListEmptyComponent={renderEmptyComponent}
          showsHorizontalScrollIndicator={false}
          horizontal={true}
          alwaysBounceHorizontal={true}
          onEndReached={() => {
            if (postQuery.hasNextPage && !postQuery.isFetchingNextPage) {
              postQuery.fetchNextPage();
            }
          }}
        />
      </VStack>
    </BottomSheet>
  );
});

const NearbyPage: React.FC = () => {
  const webViewRef = useRef<WebView | null>(null);
  const bottomSheetRef = useRef<BottomSheet | null>(null);
  const [mapLoaded, setMapLoaded] = React.useState(false);
  const [center, setCenter] = React.useState<any>(null);
  const [bounds, setBounds] = React.useState<any>(null);
  const { position, error, refresh } = usePosition();
  const { theme } = usePreferences();

  const friendsQuery = useInfiniteQuery({
    queryKey: ['friends', 'list'],
    queryFn: fetchFriends,
    initialPageParam: {
      pagination: {
        page: 1,
        pageSize: 25,
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

  const onPinButtonPress = () =>
    refresh((position: Position | null) => {
      postMessageToWebApp(webViewRef, 'setCenter', {
        longitude: position?.coords.longitude,
        latitude: position?.coords.latitude,
      });
    });

  const PinButton = () => {
    return (
      <Fab onPress={() => onPinButtonPress()}>
        <FabIcon as={LocateIcon}></FabIcon>
      </Fab>
    );
  };

  const handleWebMessage = (event: { nativeEvent: { data: string } }) => {
    const { action, payload } = JSON.parse(event.nativeEvent.data);
    console.log('received from web:', action, payload);

    if (action === 'mapComplete') {
      setMapLoaded(true);
    } else if (action === 'boundsChange') {
      setBounds(payload.bounds);
    } else if (action === 'loadNextPage') {
      console.log(payload);
    }
  };

  useEffect(() => {
    if (mapLoaded && position) {
      const { longitude, latitude } = position.coords;
      setCenter({ longitude, latitude });
      postMessageToWebApp(webViewRef, 'setParams', {
        longitude,
        latitude,
        theme,
      });
    }
  }, [position, mapLoaded, theme]);

  return (
    <>
      <SafeAreaView className="flex-1">
        <NearbyHeader />
        <VStack className="flex-1">
          <WebView
            ref={webViewRef}
            originWhitelist={['*']}
            source={{ uri: 'http://192.168.2.5:5173/' }}
            mediaCapturePermissionGrantType="grant"
            userAgent="Mozilla/5.0 (Macintosh; Intel Mac OS X 13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
            startInLoadingState
            javaScriptEnabled
            domStorageEnabled
            cacheEnabled
            thirdPartyCookiesEnabled
            allowsProtectedMedia
            allowUniversalAccessFromFileURLs
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
            renderLoading={() => <PageSpinner isVisiable={true} />}
            onMessage={handleWebMessage}
            injectedJavaScript={getWebViewInitializationScript()}></WebView>
        </VStack>
      </SafeAreaView>
      <PinButton />
      <NearbyBottomSheet ref={bottomSheetRef} />
    </>
  );
};

export default NearbyPage;
