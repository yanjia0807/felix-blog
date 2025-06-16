import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  ActionsheetItem,
  ActionsheetItemText,
} from '@/components/ui/actionsheet';
import { useMediaCamPermissions } from '@/hooks/use-media-cam-permissions';
import { useMediaLibPermissions } from '@/hooks/use-media-lib-permissions';
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
  const [cameraIsOpen, setCameraIsOpen] = useState(false);
  const toast = useToast();
  const limit = imagePickerOptions.selectionLimit || 9;
  const { requestMediaLibPermissions } = useMediaLibPermissions();
  const { requestMediaCamPermissions } = useMediaCamPermissions();

  const onFail = () => {
    toast.info({ description: `最多只能选择${limit}个` });
  };

  const selectFromLibrary = async () => {
    const result = await ImagePicker.launchImageLibraryAsync(imagePickerOptions);
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
            uri: thumbnail?.path,
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
    const hasPermission = await requestMediaLibPermissions();
    if (hasPermission) {
      await selectFromLibrary();
      onClose();
    }
  };

  const openCamera = async () => {
    if (value.length === limit) {
      onFail();
      return;
    }

    const hasPermission = await requestMediaCamPermissions();
    if (hasPermission) {
      setCameraIsOpen(true);
      onClose();
    }
  };

  const closeCamera = () => setCameraIsOpen(false);

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
        value={value}
        onChange={onChange}
        isOpen={cameraIsOpen}
        onClose={closeCamera}
      />
    </>
  );
};
