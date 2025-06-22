import { Text } from '@/components/ui/text';
import { Eclipse, Moon, SwitchCamera, Zap, ZapOff } from 'lucide-react-native';
import React, { memo, useMemo } from 'react';
import { TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCameraFormat } from 'react-native-vision-camera';
import { Icon } from './ui/icon';

export const CameraSettings: React.FC<any> = memo(function CameraSettings({
  device,
  flash,
  setFlash,
  setCameraPosition,
  targetFps,
  setTargetFps,
  enableHdr,
  setEnableHdr,
  enableNightMode,
  setEnableNightMode,
}): React.ReactElement {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const screenAspectRatio = windowHeight / windowWidth;

  const insets = useSafeAreaInsets();

  const format = useCameraFormat(device, [
    { fps: targetFps },
    { videoAspectRatio: screenAspectRatio },
    { videoResolution: 'max' },
    { photoAspectRatio: screenAspectRatio },
    { photoResolution: 'max' },
  ]);

  const supportsFlash = device?.hasFlash ?? false;

  const supportsHdr = format?.supportsPhotoHdr;

  const supports60Fps = useMemo(
    () => device?.formats.some((f) => f.maxFps >= 60),
    [device?.formats],
  );

  const canToggleNightMode = device?.supportsLowLightBoost ?? false;

  const onFlipCameraPressed = () => {
    setCameraPosition((p) => (p === 'back' ? 'front' : 'back'));
  };

  const onFlashPressed = () => {
    setFlash((f) => (f === 'off' ? 'on' : 'off'));
  };

  return (
    <View className="absolute p-4" style={{ flex: 1, right: insets.right, top: insets.top }}>
      <TouchableOpacity
        className="mb-4 h-10 w-10 items-center justify-center rounded-full bg-background-50 bg-opacity-30"
        onPress={onFlipCameraPressed}>
        <Icon as={SwitchCamera} />
      </TouchableOpacity>
      {supportsFlash && (
        <TouchableOpacity
          className="mb-4 h-10 w-10 items-center justify-center rounded-full bg-background-50 bg-opacity-30"
          onPress={onFlashPressed}>
          <Icon as={flash === 'on' ? Zap : ZapOff} />
        </TouchableOpacity>
      )}
      {supports60Fps && (
        <TouchableOpacity
          className="mb-4 h-10 w-10 items-center justify-center rounded-full bg-background-50 bg-opacity-30"
          onPress={() => setTargetFps((t) => (t === 30 ? 60 : 30))}>
          <Text className="text-center font-bold" size="sm">{`${targetFps}\nFPS`}</Text>
        </TouchableOpacity>
      )}
      {supportsHdr && (
        <TouchableOpacity
          className="mb-4 h-10 w-10 items-center justify-center rounded-full bg-background-50 bg-opacity-30"
          onPress={() => setEnableHdr((h) => !h)}>
          <Text className="text-center font-bold" size="sm">
            {enableHdr ? 'hdr' : 'hdr-off'}
          </Text>
        </TouchableOpacity>
      )}
      {canToggleNightMode && (
        <TouchableOpacity
          className="mb-4 h-10 w-10 items-center justify-center rounded-full bg-background-50 bg-opacity-30"
          onPress={() => setEnableNightMode(!enableNightMode)}>
          <Icon as={enableNightMode ? Moon : Eclipse} />
        </TouchableOpacity>
      )}
    </View>
  );
});
