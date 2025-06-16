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
import { StyleSheet, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import VideoPlayer from 'react-native-video-player';
import { Divider } from './ui/divider';
import { VStack } from './ui/vstack';

const PictureViewer: React.FC<any> = ({ data, onCommit, onUndo }) => {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const bodyHeight = windowHeight - insets.bottom - 35;

  return (
    <View className="flex-1 justify-between">
      <Image
        source={{
          uri: data.uri,
        }}
        style={{
          width: '100%',
          height: bodyHeight,
        }}
      />
      <HStack
        className="w-full items-center justify-center bg-background-50 p-2"
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
      />
      <HStack
        className="w-full items-center justify-center bg-background-50 p-2"
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
  const [data, setData] = useState<any>();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const intervalRef = useRef<any>(null);
  const cameraRef = React.useRef<CameraView>(null);
  const insets = useSafeAreaInsets();
  const MAX_DURATION = 60;

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

  const startCaptureVideo = async () => {
    setMode('video');
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
    .onEnd(async (e, success) => {
      if (success) {
        setMode('picture');
        capturePic();
      }
    })
    .runOnJS(true);

  const captureVideoGesture = Gesture.LongPress()
    .onStart(async () => {
      startCaptureVideo();
    })
    .onEnd(async (e, success) => {
      stopCaptureVideo();
    })
    .runOnJS(true);

  const captureGesture = Gesture.Exclusive(captureVideoGesture, capturePicGesture);

  useEffect(() => {
    if (isRecording && recordingTime >= MAX_DURATION) {
      cameraRef.current?.stopRecording();
    }
  }, [isRecording, recordingTime]);

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
                value={recordingTime}
                maxValue={MAX_DURATION}
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
