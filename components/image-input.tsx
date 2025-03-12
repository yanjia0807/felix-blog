import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useEvent, useEventListener } from 'expo';
import { CameraView, CameraType, useCameraPermissions, CameraMode, FlashMode } from 'expo-camera';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useVideoPlayer, VideoView } from 'expo-video';
import _ from 'lodash';
import {
  Camera,
  CircleX,
  SwitchCamera,
  ImageIcon,
  X,
  Undo,
  Check,
  Zap,
  ZapOff,
} from 'lucide-react-native';
import { FlatList, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
import { getVideoImage, isImage, isVideo, FileTypeNum } from '@/utils/file';
import { Avatar, AvatarImage, AvatarBadge } from './ui/avatar';
import { Box } from './ui/box';
import { Button, ButtonGroup, ButtonIcon, ButtonText } from './ui/button';
import { HStack } from './ui/hstack';
import { Icon } from './ui/icon';
import { Input, InputField, InputIcon, InputSlot } from './ui/input';
import { Portal } from './ui/portal';
import { Pressable } from './ui/pressable';
import { Slider, SliderFilledTrack, SliderTrack } from './ui/slider';
import { VStack } from './ui/vstack';
import useCustomToast from './use-custom-toast';

const SELECTION_LIMIT = 9;

export const ImageCamera = ({ isOpen, onClose, onChange, value }: any) => {
  const [facing, setFacing] = useState<CameraType>('back');
  const [mode, setMode] = useState<CameraMode>('picture');
  const [flash, setFlash] = useState<FlashMode>('auto');
  const [data, setData] = useState<any>();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [playToEnd, setPlayToEnd] = useState(false);
  const intervalRef = useRef<any>();
  const cameraRef = React.useRef<CameraView>(null);
  const insets = useSafeAreaInsets();
  const MAX_DURATION = 60;

  const [permission, requestPermission] = useCameraPermissions();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const player = useVideoPlayer(data?.uri, (player) => {
    player.timeUpdateEventInterval = 1;
  });

  const { isPlaying } = useEvent(player, 'playingChange', {
    isPlaying: player.playing,
  });

  useEventListener(player, 'playToEnd', () => {
    setPlayToEnd(true);
  });

  const togglePlay = useCallback(() => {
    if (isPlaying && !playToEnd) {
      player.pause();
    } else {
      if (playToEnd) {
        setPlayToEnd(false);
        player.replay();
      }
      player.play();
    }
  }, [isPlaying, playToEnd, player]);

  const toggleFacing = () => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  const toggleFlash = () => {
    switch (flash) {
      case 'auto':
        setFlash('on');
        break;
      case 'on':
        setFlash('off');
        break;
      case 'off':
        setFlash('auto');
        break;

      default:
        break;
    }
  };

  const capturePic = async () => {
    const picture = await cameraRef.current?.takePictureAsync();
    setData(picture);
  };

  const capturePicGesture = Gesture.Tap()
    .onEnd(async (e, success) => {
      if (success) {
        if (mode === 'picture') {
          capturePic();
        } else {
          setMode('picture');
          setTimeout(async () => capturePic(), 600);
        }
      }
    })
    .runOnJS(true);

  const captureVideo = async () => {
    setIsRecording(true);
    intervalRef.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);

    const video = await cameraRef.current?.recordAsync({
      maxDuration: MAX_DURATION,
    });
    setData(video);
  };

  const stopCaptureVideo = async () => {
    clearInterval(intervalRef.current);
    setIsRecording(false);
    setRecordingTime(0);
    await cameraRef.current?.stopRecording();
  };

  const captureVideoGesture = Gesture.LongPress()
    .onStart(async () => {
      if (mode === 'video') {
        captureVideo();
      } else {
        setMode('video');
        setTimeout(async () => captureVideo(), 600);
      }
    })
    .onEnd(async (e, success) => {
      stopCaptureVideo();
    })
    .runOnJS(true);

  const captureGesture = Gesture.Exclusive(captureVideoGesture, capturePicGesture);

  const onCommit = async () => {
    let val;
    if (mode === 'picture') {
      val = {
        fileType: FileTypeNum.Image,
        uri: data.uri,
        preview: data.uri,
      };
    } else {
      const thumbnail = await getVideoImage(data.uri);
      val = {
        fileType: FileTypeNum.Video,
        uri: data.uri,
        thumbnail: thumbnail?.uri,
        preview: data.uri,
      };
    }

    onChange([...value, val]);
    setData(null);
    onClose();
  };

  const onUndo = async () => {
    setData(null);
  };

  useEffect(() => {
    if (isRecording && recordingTime >= MAX_DURATION) {
      cameraRef.current?.stopRecording();
    }
  }, [isRecording, recordingTime]);

  return (
    <Portal isOpen={isOpen} style={{ flex: 1, backgroundColor: 'white' }}>
      {!permission?.granted ? (
        <VStack className="flex-1 items-center justify-center" space="md">
          <Text className="p-2">我们需要权限来显示相机</Text>
          <Button onPress={requestPermission} className="rounded">
            <ButtonText>授权访问相机</ButtonText>
          </Button>
        </VStack>
      ) : (
        <>
          {data ? (
            <>
              {mode === 'picture' ? (
                <View className="flex-1 items-center">
                  <Image
                    source={{
                      uri: data.uri,
                    }}
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: 8,
                    }}>
                    <HStack
                      className="absolute bottom-0 w-full items-center justify-center self-center px-4"
                      style={{
                        paddingBottom: insets.bottom,
                      }}
                      space="4xl">
                      <Button
                        size="xl"
                        variant="solid"
                        className="rounded-full"
                        action="secondary"
                        onPress={onCommit}>
                        <ButtonIcon as={Check} />
                      </Button>
                      <Button
                        action="negative"
                        onPress={onUndo}
                        className="absolute right-4 rounded-full opacity-50">
                        <ButtonIcon as={Undo} />
                      </Button>
                    </HStack>
                  </Image>
                </View>
              ) : (
                <View className="flex-1 items-center">
                  <VideoView
                    style={{ width: '100%', height: '100%' }}
                    contentFit="cover"
                    allowsFullscreen={false}
                    nativeControls={false}
                    allowsPictureInPicture={false}
                    player={player}
                  />
                  <Animated.View
                    entering={FadeIn.duration(100)}
                    exiting={FadeOut.duration(100)}
                    className="absolute"
                    style={{
                      left: screenWidth / 2 - 40,
                      top: screenHeight / 2 - 40,
                    }}>
                    <TouchableOpacity onPress={togglePlay}>
                      <Ionicons
                        name={isPlaying ? 'pause-circle-outline' : 'play-circle-outline'}
                        size={80}
                        className="opacity-70"
                        color="white"
                      />
                    </TouchableOpacity>
                  </Animated.View>
                  <HStack
                    className="absolute bottom-0 w-full items-center justify-center self-center px-4"
                    space="4xl"
                    style={{
                      paddingBottom: insets.bottom,
                    }}>
                    <Button
                      variant="solid"
                      className="rounded-full"
                      action="secondary"
                      size="xl"
                      onPress={onCommit}>
                      <ButtonIcon as={Check} />
                    </Button>
                    <Button
                      action="negative"
                      onPress={onUndo}
                      className="absolute right-4 rounded-full opacity-50">
                      <ButtonIcon as={Undo} />
                    </Button>
                  </HStack>
                </View>
              )}
            </>
          ) : (
            <CameraView
              ref={cameraRef}
              style={{ flex: 1, width: '100%' }}
              facing={facing}
              flash={flash}
              mode={mode}>
              <HStack
                className="absolute top-0 w-full items-center justify-between px-4"
                style={{
                  paddingTop: insets.top,
                }}>
                <Button
                  size="lg"
                  variant="link"
                  onPress={toggleFacing}
                  className="rounded-full opacity-50"
                  action="secondary">
                  <ButtonIcon as={SwitchCamera} />
                </Button>
                <Button
                  size="lg"
                  variant="link"
                  onPress={toggleFlash}
                  className="rounded-full opacity-50"
                  action="secondary">
                  {flash === 'auto' ? (
                    <ButtonText>auto</ButtonText>
                  ) : (
                    <ButtonIcon as={flash === 'on' ? Zap : ZapOff} />
                  )}
                </Button>
              </HStack>
              <HStack
                className="absolute bottom-0 w-full items-center justify-center self-center px-4"
                style={{
                  paddingBottom: insets.bottom,
                }}>
                <GestureDetector gesture={captureGesture}>
                  <TouchableOpacity className="h-20 w-20 items-center justify-center rounded-full bg-primary-500 opacity-50">
                    <Icon as={Camera} size={32 as any} />
                  </TouchableOpacity>
                </GestureDetector>
                <Button
                  action="negative"
                  onPress={onClose}
                  className="absolute right-4 rounded-full opacity-50">
                  <ButtonIcon as={CircleX} />
                </Button>
              </HStack>
              {mode === 'video' && isRecording && (
                <Slider
                  className="absolute top-1/2 w-4/5 flex-1 self-center opacity-70"
                  isDisabled={false}
                  value={recordingTime}
                  maxValue={MAX_DURATION}
                  size="sm">
                  <SliderTrack>
                    <SliderFilledTrack />
                  </SliderTrack>
                </Slider>
              )}
            </CameraView>
          )}
        </>
      )}
    </Portal>
  );
};

export const ImageInput = ({ onChange, value = [] }: any) => {
  const [isOpen, setIsOpen] = useState(false);

  const onPress = () => setIsOpen(true);
  const onClose = () => setIsOpen(false);

  const imagePickerOptions = {
    mediaTypes: ['images', 'videos', 'livePhotos'],
    allowsMultipleSelection: true,
    selectionLimit: SELECTION_LIMIT,
  };

  return (
    <>
      <ButtonGroup space="sm">
        <Button variant="link" action="secondary" onPress={onPress}>
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

export const CoverInput = ({ onChange, value, onPress }: any) => {
  const [isOpen, setIsOpen] = useState(false);

  const onInputPress = () => setIsOpen(true);

  const onClose = () => setIsOpen(false);

  const imagePickerOptions = {
    mediaTypes: ['images'],
    allowsMultipleSelection: false,
  };

  const onClearBtnPress = () => onChange(undefined);

  return (
    <>
      {value ? (
        <Pressable className="my-2 h-40" onPress={onPress}>
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
            action="secondary"
            className="absolute right-0 top-0 h-auto p-1"
            onPress={onClearBtnPress}>
            <ButtonIcon as={CircleX} />
          </Button>
        </Pressable>
      ) : (
        <>
          <Input variant="underlined" className="border-0 border-b p-2" isReadOnly={true}>
            <InputField placeholder="请选择封面...." />
            <InputSlot>
              <Pressable onPress={onInputPress}>
                <InputIcon as={ImageIcon}></InputIcon>
              </Pressable>
            </InputSlot>
          </Input>
          <ImageSheet
            isOpen={isOpen}
            onClose={onClose}
            value={value ? [value] : []}
            onChange={onChange}
            imagePickerOptions={imagePickerOptions}
          />
        </>
      )}
    </>
  );
};

export const CoverView = ({ onChange, value, onPress }: any) => {
  return (
    <>
      {value && (
        <Pressable className="h-36 flex-1" onPress={onPress}>
          <Image
            style={{
              width: '100%',
              height: '100%',
              borderRadius: 8,
            }}
            source={{
              uri: value.uri,
            }}
            alt={value.alternativeText}
          />
        </Pressable>
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

const selectFromImageLib = async ({ imagePickerOptions, value, onFail }: any) => {
  const result = await ImagePicker.launchImageLibraryAsync(imagePickerOptions);
  const val: any = [...value];
  if (result.canceled) return val;

  for (let i = 0; i < result.assets.length; i++) {
    const item: any = result.assets[i];

    if (item.assetId && !_.some(val, ['assetId', item.assetId])) {
      if (isImage(item.mimeType)) {
        val.push({
          assetId: item.assetId,
          name: item.fileName,
          fileType: FileTypeNum.Image,
          uri: item.uri,
          preview: item.uri,
        });
      } else if (isVideo(item.mimeType)) {
        const thumbnail = await getVideoImage(item.uri);
        val.push({
          assetId: item.assetId,
          name: item.fileName,
          fileType: FileTypeNum.Video,
          uri: item.uri,
          thumbnail: thumbnail?.uri,
          preview: item.uri,
        });
      }
    }
  }

  if (val.length > SELECTION_LIMIT) {
    onFail();
    return value;
  }

  return val;
};

export const ImageSheet = ({ onChange, value = [], isOpen, onClose, imagePickerOptions }: any) => {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [cameraIsOpen, setCameraIsOpen] = useState(false);
  const toast = useCustomToast();

  const onFail = () => {
    toast.info({ description: `最多只能选择${SELECTION_LIMIT}个` });
  };

  const onPressImage = async () => {
    const val = await selectFromImageLib({ imagePickerOptions, value, onFail });

    if (val !== null) {
      if (imagePickerOptions.allowsMultipleSelection) {
        onChange(val);
      } else {
        onChange(val[0]);
      }
    }

    onClose();
  };

  const onPressCamera = async () => {
    if (value.length === SELECTION_LIMIT) {
      onFail();
      return;
    }

    if (!cameraPermission?.granted) {
      const result = await requestCameraPermission();
      if (result.granted) {
        setCameraIsOpen(true);
      }
    } else {
      setCameraIsOpen(true);
    }

    onClose();
  };

  const closeCamera = () => setCameraIsOpen(false);

  return (
    <>
      <Actionsheet isOpen={isOpen} onClose={onClose}>
        <ActionsheetBackdrop />
        <ActionsheetContent>
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>
          <ActionsheetItem onPress={onPressCamera}>
            <ActionsheetItemText>拍照</ActionsheetItemText>
          </ActionsheetItem>
          <ActionsheetItem onPress={onPressImage}>
            <ActionsheetItemText>从相册选择</ActionsheetItemText>
          </ActionsheetItem>
        </ActionsheetContent>
      </Actionsheet>
      <ImageCamera value={value} onChange={onChange} isOpen={cameraIsOpen} onClose={closeCamera} />
    </>
  );
};

export const ImageItem = ({ item, index, onPress, onRemove }: any) => {
  const uri = isVideo(item.fileType) ? item.thumbnail : item.uri;

  return (
    <Pressable onPress={() => onPress(index)}>
      <Image
        style={{
          width: '100%',
          height: '100%',
          borderRadius: 8,
          opacity: 0.7,
        }}
        alt={''}
        source={uri}
      />
      <Button
        size="xs"
        action="secondary"
        className="absolute right-0 top-0 h-auto p-1"
        onPress={() => onRemove(item.uri)}>
        <ButtonIcon as={CircleX} />
      </Button>
    </Pressable>
  );
};

export const ImageGrid = ({ value = [], onPress, cover, onChange }: any) => {
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const { width: screenWidth } = useWindowDimensions();
  const numColumns = 4;
  const spacing = 16;
  const padding = 16;
  const imageSize = (screenWidth - padding * 2 - (numColumns - 1) * spacing) / numColumns;

  const onRemove = async (uri: string) => {
    onChange(_.filter(value, (item: any) => item.uri !== uri));
  };

  if (value.length > 0) {
    return (
      <HStack className="flex-wrap">
        {value.map((item: any, index: number) => (
          <Box
            key={item.id || item.assetId || item.uri}
            className="my-2"
            style={{
              width: imageSize,
              height: imageSize,
              marginRight: (index + 1) % numColumns === 0 ? 0 : spacing,
              aspectRatio: 1,
              borderRadius: 8,
            }}>
            <ImageItem
              item={item}
              index={index}
              onPress={onPress}
              onRemove={onRemove}
              selectedImage={selectedImage}
              setSelectedImage={setSelectedImage}
            />
          </Box>
        ))}
      </HStack>
    );
  }
};

export const ImageList = ({ value = [], onPress }: any) => {
  const renderItem = ({ item, index }: any) => {
    const uri = isVideo(item.fileType) ? item.thumbnail : item.uri;

    return (
      <Pressable
        onPress={() => onPress(index)}
        className={`mx-1 h-16 w-16 ${index === 0 ? 'ml-0' : ''} ${index === value.length - 1 ? 'mr-0' : ''}`}>
        <Image
          source={{
            uri,
          }}
          alt={item.alternativeText}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: 8,
            opacity: 0.7,
          }}
        />
      </Pressable>
    );
  };

  return value?.length > 0 ? (
    <FlatList
      data={value}
      horizontal={true}
      renderItem={renderItem}
      showsHorizontalScrollIndicator={false}
    />
  ) : (
    <></>
  );
};
