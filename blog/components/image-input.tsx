import { useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import _ from 'lodash';
import { CameraIcon, ImageIcon, XIcon } from 'lucide-react-native';
import React, { forwardRef, useCallback, useMemo, useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  ActionsheetItem,
  ActionsheetItemText,
  ActionsheetIcon,
} from '@/components/ui/actionsheet';
import ImageCamera from './Image-camera';
import { Button, ButtonGroup, ButtonIcon, ButtonText } from './ui/button';

export const ImageInput = ({ onChange }: any) => {
  const [showActionsheet, setShowActionsheet] = useState(false);

  const onInputIconPressed = () => setShowActionsheet(true);

  const onClose = () => setShowActionsheet(false);

  return (
    <>
      <ButtonGroup space="sm">
        <Button variant="link" action="secondary" onPress={() => onInputIconPressed()}>
          <ButtonIcon as={ImageIcon} />
          <ButtonText>图片</ButtonText>
        </Button>
      </ButtonGroup>
      <ImageSheet isOpen={showActionsheet} onClose={onClose} onChange={onChange} />
    </>
  );
};

export const ImageSheet = forwardRef(function Sheet({ onChange, isOpen, onClose }: any, ref: any) {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [cameraIsOpen, setCameraIsOpen] = useState(false);
  const insets = useSafeAreaInsets();

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
    <Actionsheet isOpen={isOpen} onClose={onClose}>
      <ActionsheetBackdrop />
      <ActionsheetContent>
        <ActionsheetDragIndicatorWrapper>
          <ActionsheetDragIndicator />
        </ActionsheetDragIndicatorWrapper>
        <ActionsheetItem onPress={() => onPressCamera()}>
          <ActionsheetItemText>拍照</ActionsheetItemText>
        </ActionsheetItem>
        <ActionsheetItem onPress={() => onPressImage()}>
          <ActionsheetItemText>从相册选择</ActionsheetItemText>
        </ActionsheetItem>
      </ActionsheetContent>
    </Actionsheet>
  );
});

export default ImageSheet;
