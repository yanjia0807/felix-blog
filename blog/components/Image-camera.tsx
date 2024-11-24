import { CameraView as ExpoCameraView, CameraType, useCameraPermissions } from 'expo-camera';
import React, { useState } from 'react';
import { Text } from '@/components/ui/text';
import { Box } from './ui/box';
import { Button, ButtonText } from './ui/button';

const ImageCamera = () => {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();

  if (!permission) {
    // Camera permissions are still loading.
    return <Box />;
  }

  if (!permission.granted) {
    return (
      <Box className="flex-1 items-center justify-center">
        <Text className="p-2">我们需要权限来显示相机</Text>
        <Button onPress={requestPermission}>
          <ButtonText>授权访问相机</ButtonText>
        </Button>
      </Box>
    );
  }

  function toggleCameraFacing() {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  }

  return (
    <Box className="flex-1">
      <ExpoCameraView className="flex-1" facing={facing}>
        <Box className="flex-1 flex-row items-end bg-background-400">
          <Button variant="solid" onPress={toggleCameraFacing}>
            <ButtonText>反转相机</ButtonText>
          </Button>
        </Box>
      </ExpoCameraView>
    </Box>
  );
};

export default ImageCamera;
