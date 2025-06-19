import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Portal } from '@/components/ui/portal';
import { Slider, SliderFilledTrack, SliderTrack } from '@/components/ui/slider';
import { createVideoThumbnail } from '@/utils/file';
import { CameraMode, CameraType, CameraView, FlashMode } from 'expo-camera';
import { Image } from 'expo-image';
import _ from 'lodash';
import { Camera, CircleX, SwitchCamera, Zap, ZapOff } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ResizeMode } from 'react-native-video';
import VideoPlayer from 'react-native-video-player';
import { Divider } from './ui/divider';
import { VStack } from './ui/vstack';

const PictureViewer: React.FC<any> = ({ data, onCommit, onUndo }) => {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 justify-between">
      <Image
        source={{
          uri: data.uri,
        }}
        style={{
          width: '100%',
          height: '100%',
        }}
      />
      <HStack
        className="absolute bottom-0 w-full items-center justify-center bg-background-50 p-2"
        style={{ paddingBottom: insets.bottom }}>
        <Button action="negative" variant="link" className="flex-1" onPress={onUndo}>
          <ButtonText>取消</ButtonText>
        </Button>
        <Button action="positive" className="flex-1" onPress={onCommit}>
          <ButtonText>确定</ButtonText>
        </Button>
      </HStack>
    </View>
  );
};

const VideoViewer: React.FC<any> = ({ data, onCommit, onUndo }) => {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const bodyHeight = windowHeight - insets.bottom - 35;

  return (
    <View className="flex-1 justify-between">
      <VideoPlayer
        source={{
          uri: data.uri,
        }}
        controls={true}
        showDuration={true}
        style={{
          width: '100%',
          height: bodyHeight,
        }}
        resizeMode={ResizeMode.COVER}
      />
      <HStack
        className="absolute bottom-0 w-full items-center justify-center bg-background-50 p-2"
        style={{ paddingBottom: insets.bottom }}>
        <Button action="negative" variant="link" className="flex-1" onPress={onUndo}>
          <ButtonText>取消</ButtonText>
        </Button>
        <Divider orientation="vertical" />
        <Button action="positive" className="flex-1" onPress={onCommit}>
          <ButtonText>确定</ButtonText>
        </Button>
      </HStack>
    </View>
  );
};

export const ImageryCamera = ({ isOpen, onClose, onChange, value }: any) => {
  const [facing, setFacing] = useState<CameraType>('back');
  const [mode, setMode] = useState<CameraMode>('picture');
  const [flash, setFlash] = useState<FlashMode>('auto');
  const [maxDuration, setMaxDuration] = useState(30);
  const [data, setData] = useState<any>();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const timerRef = useRef<any>(null);
  const cameraRef = React.useRef<CameraView>(null);
  const dataRef = useRef(null);
  const insets = useSafeAreaInsets();

  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);

  const buttonStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

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

  const capture = async () => {
    const picture = await cameraRef.current?.takePictureAsync();
    setData(picture);
  };

  const startRecording = async () => {
    if (cameraRef.current && !isRecording) {
      setIsRecording(true);
      setRecordingTime(0);
      scale.value = withSpring(1.2);
      opacity.value = withSpring(0.75);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev + 1 >= maxDuration) {
            stopRecording(true);
            return maxDuration;
          }
          return prev + 1;
        });
      }, 1000);

      try {
        dataRef.current = await cameraRef.current.recordAsync({
          maxDuration: maxDuration,
        });
      } catch (error) {
        console.error(error);
      } finally {
        clearInterval(timerRef.current);
        setIsRecording(false);
      }
    }
  };

  const stopRecording = async (success) => {
    if (isRecording) {
      clearInterval(timerRef.current);
      setIsRecording(false);
      scale.value = withSpring(1);
      opacity.value = withSpring(1);
      try {
        await cameraRef.current.stopRecording();
        if (success) {
          setData(dataRef.current);
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  const onCommit = async () => {
    let val;
    const uri = _.replace(data.uri, 'file://', '');
    const name = _.last(data.uri.split('/'));

    if (mode === 'picture') {
      val = {
        name,
        uri,
        thumbnail: uri,
        preview: uri,
      };
    } else {
      const thumbnail = await createVideoThumbnail(uri);

      val = {
        name,
        uri,
        thumbnail: thumbnail?.path,
        preview: uri,
      };
    }

    onChange([...value, val]);
    setData(null);
    onClose();
  };

  const onUndo = async () => {
    setData(null);
  };

  const capturePicGesture = Gesture.Tap()
    .onStart(() => setMode('picture'))
    .onEnd(async (e, success) => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      if (success) capture();
    })
    .runOnJS(true);

  const captureVideoGesture = Gesture.LongPress()
    .onStart(async () => {
      setMode('video');
      await new Promise((resolve) => setTimeout(resolve, 300));
      startRecording();
    })
    .onEnd(async (e, success) => {
      stopRecording(success);
    })
    .runOnJS(true);

  const pressGesture = Gesture.Exclusive(captureVideoGesture, capturePicGesture);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return (
    <Portal isOpen={isOpen} style={{ flex: 1, backgroundColor: 'white' }}>
      {data ? (
        <>
          {mode === 'picture' ? (
            <PictureViewer data={data} onCommit={onCommit} onUndo={onUndo} />
          ) : (
            <VideoViewer data={data} onCommit={onCommit} onUndo={onUndo} />
          )}
        </>
      ) : (
        <View className="flex-1">
          <CameraView
            ref={cameraRef}
            style={StyleSheet.absoluteFill}
            facing={facing}
            flash={flash}
            mode={mode}
          />
          <VStack className="flex-1 justify-between">
            <HStack
              className="absolute top-0 w-full items-center justify-between px-4"
              style={{ paddingTop: insets.top }}>
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
              <GestureDetector gesture={pressGesture}>
                <Animated.View
                  style={buttonStyle}
                  className="h-20 w-20 items-center justify-center rounded-full bg-primary-500 opacity-50">
                  <Icon as={Camera} size={32 as any} />
                </Animated.View>
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
                value={recordingTime}
                maxValue={maxDuration}
                size="sm">
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
              </Slider>
            )}
          </VStack>
        </View>
      )}
    </Portal>
  );
};
