import { Portal } from '@/components/ui/portal';
import { Text } from '@/components/ui/text';
import { useIsForeground } from '@/hooks/use-is-foreground';
import { useMediaCamPermissions } from '@/hooks/use-media-cam-permissions';
import { useMediaMicPermissions } from '@/hooks/use-media-mic-permissions';
import { createVideoThumbnail, getFilename } from '@/utils/file';
import { useIsFocused } from '@react-navigation/core';
import React, { useEffect, useRef, useState } from 'react';
import { GestureResponderEvent, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Extrapolate,
  interpolate,
  runOnJS,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {
  Camera,
  CameraProps,
  CameraRuntimeError,
  PhotoFile,
  useCameraDevice,
  useCameraFormat,
  VideoFile,
} from 'react-native-vision-camera';
import { CameraCaptureButton } from './camera-capture-button';
import { CameraPreview } from './camera-preview';
import { CameraSettings } from './camera-settings';
import { CameraTimer } from './camera-timer';

const ReanimatedCamera = Animated.createAnimatedComponent(Camera);
Animated.addWhitelistedNativeProps({
  zoom: true,
});

export const ImageryCamera = ({ isOpen, onClose, onChange }: any) => {
  const [data, setData] = useState<any>();
  const [type, setType] = useState<'photo' | 'video'>('photo');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [maxDuration] = useState(30);

  const [isCameraInitialized, setIsCameraInitialized] = useState(false);
  const [cameraPosition, setCameraPosition] = useState<'front' | 'back'>('back');
  const [enableHdr, setEnableHdr] = useState(false);
  const [flash, setFlash] = useState<'off' | 'on'>('off');
  const [enableNightMode, setEnableNightMode] = useState(false);
  const [targetFps, setTargetFps] = useState(60);

  const device = useCameraDevice(cameraPosition);
  const camera = useRef<Camera>(null);
  const { requestMediaCamPermissions } = useMediaCamPermissions();
  const { meidaMicPermission, requestMediaMicPermissions } = useMediaMicPermissions();
  const isFocussed = useIsFocused();
  const isForeground = useIsForeground();
  const isActive = isFocussed && isForeground;

  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const screenAspectRatio = windowHeight / windowWidth;

  const format = useCameraFormat(device, [
    { fps: targetFps },
    { videoAspectRatio: screenAspectRatio },
    { videoResolution: 'max' },
    { photoAspectRatio: screenAspectRatio },
    { photoResolution: 'max' },
  ]);

  const fps = Math.min(format?.maxFps ?? 1, targetFps);
  const supportsFlash = device?.hasFlash ?? false;
  const minZoom = device?.minZoom ?? 1;
  const maxZoom = Math.min(device?.maxZoom ?? 1, 10);
  const videoHdr = format?.supportsVideoHdr && enableHdr;
  const photoHdr = format?.supportsPhotoHdr && enableHdr && !videoHdr;

  const zoom = useSharedValue(1);
  const startZoom = useSharedValue(0);
  const offsetY = useSharedValue(0);
  const opacity = useSharedValue(1);

  const cameraAnimatedProps = useAnimatedProps<CameraProps>(() => {
    const z = Math.max(Math.min(zoom.value, maxZoom), minZoom);
    return {
      zoom: z,
    };
  }, [maxZoom, minZoom, zoom]);

  const containerAnimatiedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: offsetY.value }],
    opacity: opacity.value,
  }));

  const onInitialized = () => {
    setIsCameraInitialized(true);
  };

  const onError = (error: CameraRuntimeError) => {
    console.error(error);
  };

  const onFlipCameraPressed = () => {
    setCameraPosition((p) => (p === 'back' ? 'front' : 'back'));
  };

  const onFocusTap = ({ nativeEvent: event }: GestureResponderEvent) => {
    if (!device?.supportsFocus) return;
    camera.current?.focus({
      x: event.locationX,
      y: event.locationY,
    });
  };

  const onDoubleTap = () => {
    onFlipCameraPressed();
  };

  const onCaptured = async (media: PhotoFile | VideoFile, type: 'photo' | 'video') => {
    setType(type);

    if (type === 'photo') {
      const data = {
        uri: media.path,
        name: getFilename(media.path),
        thumbnail: media.path,
        preview: media.path,
        width: media.width,
        height: media.height,
        mime: 'image',
      };
      setData(data);
    } else {
      const thumbnail = await createVideoThumbnail(media.path);
      const data = {
        uri: media.path,
        name: getFilename(media.path),
        thumbnail: thumbnail?.path,
        preview: media.path,
        width: media.width,
        height: media.height,
        mime: 'video',
      };
      setData(data);
    }
  };

  const onCommit = async () => {
    onChange(data);
    setType(undefined);
    setData(undefined);
    onClose();
  };

  const onClosePreview = () => {
    setType(undefined);
    setData(undefined);
  };

  const pinch = Gesture.Pinch()
    .enabled(isActive)
    .onStart(() => {
      startZoom.value = zoom.value;
    })
    .onUpdate((e) => {
      const scale = interpolate(e.scale, [1 - 1 / 3, 1, 3], [-1, 0, 1], Extrapolate.CLAMP);
      zoom.value = interpolate(
        scale,
        [-1, 0, 1],
        [minZoom, startZoom.value, maxZoom],
        Extrapolate.CLAMP,
      );
    });

  const pan = Gesture.Pan()
    .activeOffsetY([-5, 5])
    .onUpdate((e) => {
      if (Math.abs(e.translationX) < Math.abs(e.translationY)) {
        offsetY.value = e.translationY;
        opacity.value = 1 - Math.min(1, Math.abs(e.translationY) / 300);
      }
    })
    .onEnd((e) => {
      if (Math.abs(e.translationY) > 100 || Math.abs(e.velocityY) > 800) {
        runOnJS(onClose)();
      } else {
        offsetY.value = withSpring(0, { damping: 15, stiffness: 120 });
        opacity.value = withSpring(1, { damping: 15, stiffness: 120 });
      }
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      runOnJS(onDoubleTap)();
    });

  useEffect(() => {
    requestMediaCamPermissions();
    requestMediaMicPermissions();
  }, [requestMediaCamPermissions, requestMediaMicPermissions]);

  useEffect(() => {
    zoom.value = device?.neutralZoom ?? 1;
  }, [zoom, device, opacity, offsetY, startZoom]);

  useEffect(() => {
    if (!isOpen) {
      opacity.value = 1;
      offsetY.value = 0;
    }
  }, [isOpen, offsetY, opacity]);

  if (data) {
    return <CameraPreview type={type} data={data} onClose={onClosePreview} onCommit={onCommit} />;
  }

  if (!device) {
    return (
      <Portal isOpen={isOpen} style={{ flex: 1, backgroundColor: 'black' }}>
        <GestureDetector gesture={pan}>
          <Animated.View style={[{ flex: 1 }, containerAnimatiedStyle]}>
            <View className="flex-1 items-center justify-center">
              <Text size="sm">未找到相机</Text>
            </View>
          </Animated.View>
        </GestureDetector>
      </Portal>
    );
  }

  return (
    <Portal isOpen={isOpen} style={{ flex: 1, backgroundColor: 'black' }}>
      <View className="flex-1">
        <GestureDetector gesture={pan}>
          <Animated.View style={[{ flex: 1 }, containerAnimatiedStyle]}>
            <GestureDetector gesture={pinch}>
              <Animated.View onTouchEnd={onFocusTap} style={StyleSheet.absoluteFill}>
                <GestureDetector gesture={doubleTap}>
                  <ReanimatedCamera
                    style={StyleSheet.absoluteFill}
                    device={device}
                    isActive={isActive}
                    ref={camera}
                    onInitialized={onInitialized}
                    onError={onError}
                    format={format}
                    fps={fps}
                    photoHdr={photoHdr}
                    videoHdr={videoHdr}
                    photoQualityBalance="quality"
                    lowLightBoost={device.supportsLowLightBoost && enableNightMode}
                    enableZoomGesture={false}
                    animatedProps={cameraAnimatedProps}
                    exposure={0}
                    outputOrientation="device"
                    photo={true}
                    video={true}
                    audio={meidaMicPermission === 'granted'}
                  />
                </GestureDetector>
              </Animated.View>
            </GestureDetector>
          </Animated.View>
        </GestureDetector>

        <CameraCaptureButton
          camera={camera}
          onCaptured={onCaptured}
          flash={supportsFlash ? flash : 'off'}
          enabled={isCameraInitialized && isActive}
          setIsRecording={setIsRecording}
          setRecordingTime={setRecordingTime}
          maxDuration={maxDuration}
        />

        <CameraSettings
          device={device}
          flash={flash}
          setFlash={setFlash}
          setCameraPosition={setCameraPosition}
          targetFps={targetFps}
          setTargetFps={setTargetFps}
          enableHdr={enableHdr}
          setEnableHdr={setEnableHdr}
          enableNightMode={enableNightMode}
          setEnableNightMode={setEnableNightMode}
        />

        {isRecording && <CameraTimer recordingTime={recordingTime} maxDuration={maxDuration} />}
      </View>
    </Portal>
  );
};
