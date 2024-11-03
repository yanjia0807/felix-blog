import React, { useState } from "react";
import {
  CameraView as ExpoCameraView,
  CameraType,
  useCameraPermissions,
} from "expo-camera";
import { Box } from "./ui/box";
import { Button, ButtonText } from "./ui/button";
import { Text } from "@/components/ui/text";

const CameraView = () => {
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();

  if (!permission) {
    // Camera permissions are still loading.
    return <Box />;
  }

  if (!permission.granted) {
    return (
      <Box className="flex-1 justify-center items-center">
        <Text className="p-2">我们需要权限来显示相机</Text>
        <Button onPress={requestPermission}>
          <ButtonText>授权访问相机</ButtonText>
        </Button>
      </Box>
    );
  }

  function toggleCameraFacing() {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }

  return (
    <Box className="flex-1">
      <ExpoCameraView className="flex-1" facing={facing}>
        <Box className="flex-1 flex-row bg-background-400 items-end">
          <Button variant="solid" onPress={toggleCameraFacing}>
            <ButtonText>反转相机</ButtonText>
          </Button>
        </Box>
      </ExpoCameraView>
    </Box>
  );
};

export default CameraView;
