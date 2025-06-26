import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  ActionsheetItem,
  ActionsheetItemText,
} from '@/components/ui/actionsheet';
import { useCamPermissions } from '@/hooks/use-cam-permissions';
import { useMediaLibPermissions } from '@/hooks/use-media-lib-permissions';
import { useMicPermissions } from '@/hooks/use-mic-permissions';
import useToast from '@/hooks/use-toast';
import { createVideoThumbnail } from '@/utils/file';
import * as ImagePicker from 'expo-image-picker';
import _ from 'lodash';
import React, { useState } from 'react';
import { ImageryCamera } from './imagery-camera';

export const ImagerySheet = ({
  onChange,
  value = [],
  isOpen,
  onClose,
  imagePickerOptions,
}: any) => {
  const [hasMicPermission, setHasMicPermission] = useState(false);
  const [cameraIsOpen, setCameraIsOpen] = useState(false);
  const toast = useToast();
  const limit = imagePickerOptions.selectionLimit || 9;
  const { requestMediaLibPermissions } = useMediaLibPermissions();
  const { requestCamPermissions } = useCamPermissions();
  const { requestMicPermissions } = useMicPermissions();

  const onFail = () => {
    toast.info({ description: `最多只能选择${limit}个` });
  };

  const selectFromLibrary = async () => {
    const result = await ImagePicker.launchImageLibraryAsync(
      _.merge(
        {
          quality: 0.7,
        },
        imagePickerOptions,
      ),
    );
    if (result.canceled) return value;
    const val: any = [...value];

    for (let i = 0; i < result.assets.length; i++) {
      const item: any = result.assets[i];

      if (item.assetId && !_.some(val, ['assetId', item.assetId])) {
        if (_.startsWith(item.mimeType, 'image')) {
          val.push({
            name: item.fileName,
            mime: item.mimeType,
            uri: item.uri,
            thumbnail: item.uri,
            preview: item.uri,
          });
        } else if (_.startsWith(item.mimeType, 'video')) {
          const thumbnail = await createVideoThumbnail(item.uri);

          val.push({
            name: item.fileName,
            mime: item.mimeType,
            uri: item.uri,
            thumbnail: thumbnail?.path,
            preview: item.uri,
          });
        }
      }
    }

    if (val.length > limit) {
      onFail();
      return;
    }

    if (val !== null) {
      onChange(val);
    }
  };

  const openLibrary = async () => {
    const permission = await requestMediaLibPermissions();

    if (permission) {
      await selectFromLibrary();
      onClose();
    }
  };

  const openCamera = async () => {
    const camPermission = await requestCamPermissions();

    if (camPermission === 'granted') {
      const micPermission = await requestMicPermissions();
      setHasMicPermission(micPermission === 'granted');
      setCameraIsOpen(true);
      onClose();
    }

    if (value.length === limit) {
      onFail();
      return;
    }
  };

  const closeCamera = () => {
    setCameraIsOpen(false);
  };

  const handleCameraChange = (result) => {
    onChange([...value, result]);
  };

  return (
    <>
      <Actionsheet isOpen={isOpen} onClose={onClose}>
        <ActionsheetBackdrop />
        <ActionsheetContent>
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>
          <ActionsheetItem onPress={openCamera}>
            <ActionsheetItemText>拍照</ActionsheetItemText>
          </ActionsheetItem>
          <ActionsheetItem onPress={openLibrary}>
            <ActionsheetItemText>从相册选择</ActionsheetItemText>
          </ActionsheetItem>
        </ActionsheetContent>
      </Actionsheet>
      <ImageryCamera
        onChange={handleCameraChange}
        isOpen={cameraIsOpen}
        hasMicPermission={hasMicPermission}
        onClose={closeCamera}
      />
    </>
  );
};
