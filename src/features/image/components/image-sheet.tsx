import React, { useState } from 'react';
import { useCameraPermissions } from 'expo-camera';
import Constants from 'expo-constants';
import * as ImagePicker from 'expo-image-picker';
import _ from 'lodash';
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  ActionsheetItem,
  ActionsheetItemText,
} from '@/components/ui/actionsheet';
import useToast from '@/hooks/use-toast';
import { createVideoThumbnail, isImage, isVideo, FileTypeNum } from '@/utils/file';
import { ImageCamera } from './image-camera';

const SELECTION_LIMIT = 9;
const appName = Constants?.expoConfig?.extra?.name || '';

export const ImageSheet = ({ onChange, value = [], isOpen, onClose, imagePickerOptions }: any) => {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [libraryPermissions, requestLibraryPermission] = ImagePicker.useMediaLibraryPermissions();
  const [cameraIsOpen, setCameraIsOpen] = useState(false);
  const toast = useToast();

  const onFail = () => {
    toast.info({ description: `最多只能选择${SELECTION_LIMIT}个` });
  };

  const selectFromLibrary = async () => {
    const result = await ImagePicker.launchImageLibraryAsync(imagePickerOptions);
    const val: any = [...value];
    if (result.canceled) return val;

    for (let i = 0; i < result.assets.length; i++) {
      const item: any = result.assets[i];

      if (item.assetId && !_.some(val, ['assetId', item.assetId])) {
        if (isImage(item.mimeType)) {
          val.push({
            assetId: item.assetId,
            name: item.fileName,
            fileType: FileTypeNum.Image,
            mime: item.mimeType,
            uri: item.uri,
            thumbnail: item.uri,
            preview: item.uri,
          });
        } else if (isVideo(item.mimeType)) {
          const thumbnail = await createVideoThumbnail(item.uri);
          val.push({
            assetId: item.assetId,
            name: item.fileName,
            fileType: FileTypeNum.Video,
            mime: item.mimeType,
            uri: item.uri,
            thumbnail: thumbnail?.uri,
            preview: item.uri,
          });
        }
      }
    }

    if (val.length > SELECTION_LIMIT) {
      onFail();
      return;
    }

    if (val !== null) {
      onChange(val);
    }
  };

  const openLibrary = async () => {
    if (libraryPermissions?.granted) {
      await selectFromLibrary();
      onClose();
    } else {
      const result = await requestLibraryPermission();
      if (result.granted) {
        await selectFromLibrary();
        onClose();
      } else {
        if (!result.canAskAgain) {
          toast.info({
            description: `请在 [系统设置] 里允许 ${appName} 访问您的照片。`,
          });
        }
      }
    }
  };

  const openCamera = async () => {
    if (value.length === SELECTION_LIMIT) {
      onFail();
      return;
    }

    if (cameraPermission?.granted) {
      setCameraIsOpen(true);
    } else {
      const result = await requestCameraPermission();
      if (result.granted) {
        setCameraIsOpen(true);
      } else {
        if (!result.canAskAgain) {
          toast.info({
            description: `请在 [系统设置] 里允许 ${appName} 访问您的相机。`,
          });
        }
      }
    }

    onClose();
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
      <ImageCamera value={value} onChange={onChange} isOpen={cameraIsOpen} onClose={closeCamera} />
    </>
  );
};
