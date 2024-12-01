import { useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import _ from 'lodash';
import { CameraIcon, ImageIcon, CircleXIcon, XIcon } from 'lucide-react-native';
import React, { useState } from 'react';
import ImageCamera from './Image-camera';
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicatorWrapper,
  ActionsheetDragIndicator,
  ActionsheetItem,
  ActionsheetIcon,
  ActionsheetItemText,
} from './ui/actionsheet';

const PostImageSheet = ({ isOpen, onClose, onChange, value }: any) => {
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
      onChange(result.assets);
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
            <ActionsheetIcon size="md" as={CameraIcon} />
            <ActionsheetItemText size="md">拍照</ActionsheetItemText>
          </ActionsheetItem>
          <ActionsheetItem onPress={onPressImage}>
            <ActionsheetIcon size="md" as={ImageIcon} />
            <ActionsheetItemText size="md">从相册选择</ActionsheetItemText>
          </ActionsheetItem>
          <ActionsheetItem onPress={onClose}>
            <ActionsheetIcon size="md" as={XIcon} />
            <ActionsheetItemText size="md">取消</ActionsheetItemText>
          </ActionsheetItem>
        </ActionsheetContent>
      </Actionsheet>
      {cameraIsOpen && <ImageCamera />}
    </>
  );
};

export default PostImageSheet;
