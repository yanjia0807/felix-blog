import { KeyboardAvoidingView, Platform } from "react-native";
import React, { useContext, useState } from "react";
import { CameraIcon, ImageIcon, CircleXIcon, MicIcon } from "lucide-react-native";
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
import { BottomSheet } from "./ui/bottomsheet";

const MeidaPickerSheet = ({
  isOpen,
  onClose,
  onPressImage,
  onPressCamera,
  onPressRecording,
}: any) => {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
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
          <BottomSheet>
            <ActionsheetItem onPress={onPressRecording}>
              <ActionsheetIcon className="stroke-background-700" as={MicIcon} />
              <ActionsheetItemText>录音</ActionsheetItemText>
            </ActionsheetItem>
          </BottomSheet>
          <ActionsheetItem onPress={onClose}>
            <ActionsheetIcon
              className="stroke-background-400"
              as={CircleXIcon}
            />
            <ActionsheetItemText>取消</ActionsheetItemText>
          </ActionsheetItem>
        </ActionsheetContent>
      </Actionsheet>
    </KeyboardAvoidingView>
  );
};

export default MeidaPickerSheet;
