import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import _ from 'lodash';
import { Camera, CircleX, SwitchCamera, ImageIcon, X, Plus, Trash2 } from 'lucide-react-native';
import React, { forwardRef, useState } from 'react';
import { FlatList, SafeAreaView, useWindowDimensions } from 'react-native';
import { apiServerURL } from '@/api';
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  ActionsheetItem,
  ActionsheetItemText,
} from '@/components/ui/actionsheet';
import { Text } from '@/components/ui/text';
import { Avatar, AvatarImage, AvatarBadge, AvatarFallbackText } from './ui/avatar';
import { Box } from './ui/box';
import { Button, ButtonGroup, ButtonIcon, ButtonText } from './ui/button';
import { HStack } from './ui/hstack';
import { Icon } from './ui/icon';
import { Input, InputField, InputIcon, InputSlot } from './ui/input';
import { Popover, PopoverBackdrop, PopoverContent } from './ui/popover';
import { Portal } from './ui/portal';
import { Pressable } from './ui/pressable';
import { VStack } from './ui/vstack';

export const ImageCamera = ({ isOpen, onClose, onChange, value, imagePickerOptions }: any) => {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = React.useRef<any>(null);

  function toggleCameraFacing() {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  }

  async function handleCapture() {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        let val;
        if (imagePickerOptions.allowsMultipleSelection) {
          val = [...value, photo];
        } else {
          val = photo;
        }
        onChange(val);
        onClose();
      } catch (error) {
        console.error(error);
      }
    }
  }

  return (
    <Portal isOpen={isOpen} style={{ flex: 1, backgroundColor: 'white' }}>
      {!permission ? (
        <></>
      ) : !permission.granted ? (
        <VStack className="flex-1 items-center justify-center">
          <Text className="p-2">我们需要权限来显示相机</Text>
          <Button onPress={requestPermission}>
            <ButtonText>授权访问相机</ButtonText>
          </Button>
        </VStack>
      ) : (
        <CameraView style={{ flex: 1, width: '100%' }} facing={facing} ref={cameraRef}>
          <SafeAreaView className="flex-1">
            <VStack className="flex-1 items-center justify-end">
              <HStack className="" space="4xl">
                <Button
                  variant="solid"
                  onPress={toggleCameraFacing}
                  className="rounded-full"
                  action="secondary">
                  <ButtonIcon as={SwitchCamera} />
                </Button>
                <Button
                  variant="solid"
                  size="xl"
                  onPress={handleCapture}
                  className="rounded-full"
                  action="primary">
                  <ButtonIcon as={Camera} />
                </Button>
                <Button action="negative" onPress={() => onClose()} className="rounded-full">
                  <ButtonIcon as={CircleX} />
                </Button>
              </HStack>
            </VStack>
          </SafeAreaView>
        </CameraView>
      )}
    </Portal>
  );
};

export const ImageInput = ({ onChange, value }: any) => {
  const [isOpen, setIsOpen] = useState(false);

  const onInputIconPressed = () => setIsOpen(true);

  const onClose = () => setIsOpen(false);

  const imagePickerOptions = {
    mediaTypes: ['images', 'videos', 'livePhotos'],
    allowsMultipleSelection: true,
    selectionLimit: 9,
  };

  return (
    <>
      <ButtonGroup space="sm">
        <Button variant="link" action="secondary" onPress={() => onInputIconPressed()}>
          <ButtonIcon as={ImageIcon} />
          <ButtonText>图片</ButtonText>
        </Button>
      </ButtonGroup>
      <ImageSheet
        isOpen={isOpen}
        onClose={onClose}
        value={value}
        onChange={onChange}
        imagePickerOptions={imagePickerOptions}
      />
    </>
  );
};

export const CoverInput = ({ onChange, value }: any) => {
  const [isOpen, setIsOpen] = useState(false);

  const onInputIconPressed = () => {
    setIsOpen(true);
  };

  const onClose = () => setIsOpen(false);

  const imagePickerOptions = {
    mediaTypes: ['images'],
    allowsMultipleSelection: false,
  };

  const onClearBtnPress = () => onChange(undefined);

  return (
    <>
      {value ? (
        <VStack className="my-2 h-40">
          <Image
            style={{
              width: '100%',
              height: '100%',
              borderRadius: 8,
            }}
            contentFit="cover"
            contentPosition="center"
            source={{
              uri: value.uri,
            }}
          />
          <Button
            size="xs"
            action="negative"
            className="absolute bottom-0 right-0 p-1"
            onPress={() => onClearBtnPress()}>
            <ButtonIcon as={Trash2} />
          </Button>
        </VStack>
      ) : (
        <>
          <Input variant="underlined" className="border-0 border-b p-2" isReadOnly={true}>
            <InputField placeholder="请选择封面...." />
            <InputSlot>
              <Pressable onPress={() => onInputIconPressed()}>
                <InputIcon as={ImageIcon}></InputIcon>
              </Pressable>
            </InputSlot>
          </Input>
          <ImageSheet
            isOpen={isOpen}
            onClose={onClose}
            value={value}
            onChange={onChange}
            imagePickerOptions={imagePickerOptions}
          />
        </>
      )}
    </>
  );
};

export const AvatarImageInput = ({ onChange, value }: any) => {
  const [showActionsheet, setShowActionsheet] = useState(false);

  const onInputIconPressed = () => setShowActionsheet(true);

  const onRemoveIconPressed = () => {
    onChange(null);
  };

  const onClose = () => setShowActionsheet(false);

  const imagePickerOptions = {
    allowsMultipleSelection: false,
    mediaTypes: ['images'],
  };

  let source: any;

  if (value) {
    if (value.id) {
      source = { uri: `${apiServerURL}${value.formats.thumbnail.url}` };
    } else if (value.length > 0 && value[0].uri) {
      source = { uri: value[0].uri };
    } else if (value.uri) {
      source = { uri: value.uri };
    }
  } else {
    source = null;
  }

  return (
    <>
      <Pressable onPress={() => onInputIconPressed()}>
        <Avatar size="xl">
          {source && <AvatarImage source={source} />}
          <AvatarBadge className="items-center justify-center">
            <Pressable onPress={() => onRemoveIconPressed()}>
              <Icon as={X} size="xs" />
            </Pressable>
          </AvatarBadge>
        </Avatar>
      </Pressable>
      <ImageSheet
        isOpen={showActionsheet}
        onClose={onClose}
        onChange={onChange}
        imagePickerOptions={imagePickerOptions}
      />
    </>
  );
};

export const ImageSheet = forwardRef(function Sheet(
  { onChange, value, isOpen, onClose, imagePickerOptions }: any,
  ref: any,
) {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [cameraIsOpen, setCameraIsOpen] = useState(false);

  const onPressImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync(imagePickerOptions);
    if (!result.canceled) {
      let val;
      if (imagePickerOptions.allowsMultipleSelection) {
        val = _.uniqBy([...value, ...result.assets], 'uri');
      } else {
        val = result.assets[0];
      }

      onChange(val);
    }
    onClose();
  };

  const onPressCamera = async () => {
    if (!cameraPermission) return;

    if (cameraPermission && !cameraPermission.granted) {
      const result = await requestCameraPermission();
      if (result.granted) {
        setCameraIsOpen(true);
      }
    } else {
      setCameraIsOpen(true);
    }

    onClose();
  };

  return (
    <>
      <Actionsheet isOpen={isOpen} onClose={onClose}>
        <ActionsheetBackdrop />
        <ActionsheetContent>
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>
          <ActionsheetItem onPress={() => onPressCamera()}>
            <ActionsheetItemText>拍照</ActionsheetItemText>
          </ActionsheetItem>
          <ActionsheetItem onPress={() => onPressImage()}>
            <ActionsheetItemText>从相册选择</ActionsheetItemText>
          </ActionsheetItem>
        </ActionsheetContent>
      </Actionsheet>
      <ImageCamera
        value={value}
        onChange={onChange}
        isOpen={cameraIsOpen}
        onClose={() => setCameraIsOpen(false)}
        imagePickerOptions={imagePickerOptions}
      />
    </>
  );
});

export const ImageItem = ({
  image,
  index,
  handleSetCover,
  onOpenGallery,
  onRemove,
  setCover,
  selectedImage,
  setSelectedImage,
}: any) => {
  return (
    <Popover
      key={image.uri}
      isOpen={selectedImage?.uri === image.uri}
      onClose={() => setSelectedImage(null)}
      shouldOverlapWithTrigger={true}
      trigger={(triggerProps: any) => (
        <Pressable
          {...triggerProps}
          onPress={() => onOpenGallery(index)}
          onLongPress={() => setSelectedImage(image)}>
          <Image
            style={{
              width: '100%',
              height: '100%',
              borderRadius: 8,
            }}
            alt={image.alternativeText || image.uri}
            source={{
              uri: image.uri,
            }}
          />
          {onRemove && (
            <Button
              size="xs"
              action="negative"
              className="absolute bottom-0 right-0 p-1"
              onPress={() => onRemove(image.uri)}>
              <ButtonIcon as={Trash2} />
            </Button>
          )}
        </Pressable>
      )}>
      <PopoverBackdrop />
      <PopoverContent size="xs" className="p-1">
        <Button size="xs" variant="link" onPress={() => setCover(image)}>
          <ButtonText>设为封面</ButtonText>
        </Button>
      </PopoverContent>
    </Popover>
  );
};

export const ImageGrid = ({ images, onOpenGallery, onRemove, className, onSetCover }: any) => {
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const { width: screenWidth } = useWindowDimensions();
  const numColumns = 4;
  const spacing = 10;
  const padding = 16;
  const imageSize = (screenWidth - padding * 2 - (numColumns - 1) * spacing) / numColumns;

  const setCover = (image: any) => {
    setSelectedImage(null);
    onSetCover(image);
  };

  if (images.length > 0) {
    return (
      <HStack className="flex-wrap">
        {images.map((image: any, index: number) => (
          <Box
            key={image.uri}
            className="my-2"
            style={{
              width: imageSize,
              height: imageSize,
              marginRight: (index + 1) % numColumns === 0 ? 0 : spacing,
              aspectRatio: 1,
              borderRadius: 8,
            }}>
            <ImageItem
              image={image}
              index={index}
              onOpenGallery={onOpenGallery}
              onRemove={onRemove}
              setCover={setCover}
              selectedImage={selectedImage}
              setSelectedImage={setSelectedImage}
            />
          </Box>
        ))}
      </HStack>
    );
  }
};

export const ImageList = ({ images, onOpenGallery }: any) => {
  const renderItem = ({ item, index }: any) => {
    return (
      <Pressable
        onPress={() => {
          onOpenGallery && onOpenGallery(index);
        }}
        className={`mx-1 h-14 w-14 ${index === 0 ? 'ml-0' : ''} ${index === images.length - 1 ? 'mr-0' : ''}`}>
        <Image
          source={{
            uri: item.uri,
          }}
          alt={item.alternativeText}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: 8,
          }}
        />
      </Pressable>
    );
  };

  return images?.length > 0 ? (
    <FlatList
      data={images}
      horizontal={true}
      renderItem={renderItem}
      showsHorizontalScrollIndicator={false}
    />
  ) : (
    <></>
  );
};
