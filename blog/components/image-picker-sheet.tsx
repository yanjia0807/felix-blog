import React, { useState } from "react";
import { CameraIcon, ImageIcon, CircleXIcon } from "lucide-react-native";
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicatorWrapper,
  ActionsheetDragIndicator,
  ActionsheetItem,
  ActionsheetIcon,
  ActionsheetItemText,
} from "./ui/actionsheet";
import { useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import _ from "lodash";
import CameraView from "./camera-view";

const ImagePickerSheet = ({ isOpen, onClose, setImages }: any) => {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [cameraIsOpen, setCameraIsOpen] = useState(false);

  const onPressImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: true,
      selectionLimit: 9,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) {
      setImages((pre: any) => _.unionBy(pre, result.assets, "assetId"));
    }
    onClose();
  };

  const onPressCamera = async () => {
    if (cameraPermission && !cameraPermission.granted) {
      const result = await requestCameraPermission();
      if (result.granted) {
        setCameraIsOpen(true);
      }
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
          <ActionsheetItem onPress={onPressCamera}>
            <ActionsheetIcon
              className="stroke-background-700"
              as={CameraIcon}
            />
            <ActionsheetItemText>拍照</ActionsheetItemText>
          </ActionsheetItem>
          <ActionsheetItem onPress={onPressImage}>
            <ActionsheetIcon className="stroke-background-700" as={ImageIcon} />
            <ActionsheetItemText>从相册选择</ActionsheetItemText>
          </ActionsheetItem>
          <ActionsheetItem onPress={onClose}>
            <ActionsheetIcon
              className="stroke-background-400"
              as={CircleXIcon}
            />
            <ActionsheetItemText>取消</ActionsheetItemText>
          </ActionsheetItem>
        </ActionsheetContent>
      </Actionsheet>
      {cameraIsOpen && <CameraView />}
    </>
  );
};

export default ImagePickerSheet;
