import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useEvent, useEventListener } from 'expo';
import { CameraView, CameraType, CameraMode, FlashMode } from 'expo-camera';
import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Camera, CircleX, SwitchCamera, Undo, Check, Zap, ZapOff } from 'lucide-react-native';
import { TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Portal } from '@/components/ui/portal';
import { Slider, SliderFilledTrack, SliderTrack } from '@/components/ui/slider';
import { createVideoThumbnail, FileTypeNum } from '@/utils/file';

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
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const MAX_DURATION = 60;

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
        thumbnail: data.uri,
        preview: data.uri,
      };
    } else {
      const thumbnail = await createVideoThumbnail(data.uri);
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
    </Portal>
  );
};
