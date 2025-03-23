import React, { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BottomSheetBackdrop, BottomSheetFlatList, BottomSheetModal } from '@gorhom/bottom-sheet';
import Constants from 'expo-constants';
import { Stack, useRouter } from 'expo-router';
import _ from 'lodash';
import { ChevronLeft, Heading } from 'lucide-react-native';
import { SafeAreaView, View } from 'react-native';
import { request, PERMISSIONS, RESULTS, check } from 'react-native-permissions';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import PageSpinner from '@/components/page-spinner';
import { TagList } from '@/components/tag-input';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Divider } from '@/components/ui/divider';
import { VStack } from '@/components/ui/vstack';
import useCustomToast from '@/components/use-custom-toast';
const appName = Constants?.expoConfig?.extra?.name || '';

const MapInfoSheet = forwardRef(function Sheet({ value = [], onChange }: any, ref: any) {
  const [selectedTags, setSelectedTags] = useState<any>([]);
  const snapPoints = useMemo(() => ['40%', '100%'], []);
  const insets = useSafeAreaInsets();
  const [data, setDate] = useState<any>([]);

  const renderItem = ({ item }: any) => {
    return <View></View>;
  };

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
        <TagList value={selectedTags} onChange={onChange} />
        <BottomSheetFlatList
          data={data}
          keyExtractor={(item: any) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: insets.bottom + 60 }}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          extraData={{ selectedTags }}
        />
      </VStack>
    </BottomSheetModal>
  );
});

const MapPage = () => {
  const webViewRef = useRef<WebView>(null);
  const renderLoading = () => <PageSpinner isVisiable={true} />;
  const router = useRouter();
  const toast = useCustomToast();
  const bottomSheetRef = useRef<BottomSheetModal>(null);

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

  const showInfo = () => {
    bottomSheetRef.current?.present();
  };

  const onMessage = (message: WebViewMessageEvent) => {
    const data = JSON.parse(message.nativeEvent.data);
    const { actionType, payload } = data;
    console.log('message', actionType, payload);

    if (actionType === 'showInfo') {
      showInfo();
    }
  };

  useEffect(() => {
    const checkPermission = async () => {
      const status = await check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);

      if (status === RESULTS.BLOCKED) {
        toast.info({
          description: `请在 [系统设置] 里允许 ${appName} 访问您的位置。`,
        });
      } else if (status === RESULTS.DENIED) {
        const status = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
        if (status !== RESULTS.GRANTED) {
          toast.info({
            description: `请在 [系统设置] 里允许 ${appName} 访问您的位置。`,
          });
        }
      }
    };

    checkPermission();
  }, []);

  return (
    <>
      <Stack.Screen
        options={{
          title: '',
          headerShown: true,
          headerLeft: renderHeaderLeft,
        }}
      />
      <SafeAreaView className="flex-1">
        <WebView
          ref={webViewRef}
          originWhitelist={['*']}
          geolocationEnabled={true}
          startInLoadingState={true}
          allowFileAccessFromFileURLs={true}
          webviewDebuggingEnabled={true}
          renderLoading={renderLoading}
          className="flex-1"
          source={{ uri: 'http://192.168.2.5:5500/assets/htmls/amap.html' }}
          onMessage={onMessage}
        />
      </SafeAreaView>
      <MapInfoSheet ref={bottomSheetRef} />
    </>
  );
};

export default MapPage;
