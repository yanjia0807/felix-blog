import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetFooter,
} from '@gorhom/bottom-sheet';
import { useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import _ from 'lodash';
import { CameraIcon, ImageIcon, XIcon } from 'lucide-react-native';
import React, { forwardRef, useCallback, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ImageCamera from './Image-camera';
import { Divider } from './ui/divider';
import { HStack } from './ui/hstack';
import { Icon } from './ui/icon';
import { Pressable } from './ui/pressable';
import { Text } from './ui/text';
import { VStack } from './ui/vstack';

const PostImageSheet = forwardRef(function Sheet({ onChange, value }: any, ref: any) {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [cameraIsOpen, setCameraIsOpen] = useState(false);
  const insets = useSafeAreaInsets();
  const onPressImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: true,
      selectionLimit: 9,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) {
      onChange(result.assets);
    }
    ref.current?.close();
  };

  const onPressCamera = async () => {
    if (cameraPermission && !cameraPermission.granted) {
      const result = await requestCameraPermission();
      if (result.granted) {
        setCameraIsOpen(true);
      }
    }
    ref.current?.close();
  };

  const [options, setOptions] = useState([
    {
      icon: CameraIcon,
      label: '拍照',
      action: onPressCamera,
    },
    {
      icon: ImageIcon,
      label: '从相册选择',
      action: onPressImage,
    },
    {
      icon: XIcon,
      label: '取消',
      action: () => ref.current?.close(),
    },
  ]);

  const renderItem = ({ item }: any) => {
    return (
      <Pressable onPress={() => item['action']()}>
        <HStack space="xs" className="items-center p-2">
          <Icon as={item.icon} />
          <Text>{item.label}</Text>
        </HStack>
      </Pressable>
    );
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
  const renderFooter = (props: any) => {
    return (
      <BottomSheetFooter
        {...props}
        bottomInset={insets.bottom}
        style={{ paddingHorizontal: 16 }}></BottomSheetFooter>
    );
  };

  const renderItemSeparator = (props: any) => <Divider {...props} className="my-2" />;

  return (
    <BottomSheet
      ref={ref}
      enableDynamicSizing={true}
      enablePanDownToClose={true}
      index={-1}
      backdropComponent={renderBackdrop}
      footerComponent={renderFooter}>
      <BottomSheetFlatList
        contentContainerClassName="p-4 bg-background-100"
        data={options}
        keyExtractor={(item: any, index: number) => index.toString()}
        ItemSeparatorComponent={renderItemSeparator}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />
    </BottomSheet>
  );
});

export default PostImageSheet;
