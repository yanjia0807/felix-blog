import React from "react";
import { CloseIcon } from "./ui/icon";
import { Image } from "expo-image";
import { Button, ButtonIcon } from "./ui/button";
import { Portal } from "@/components/ui/portal";
import { Box } from "./ui/box";
import { VStack } from "./ui/vstack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";

const ImagePreviewModal = ({ image, isOpen, onClose }: any) => {
  const safeAreaInsets = useSafeAreaInsets();
  if (!isOpen) return;
  
  return (
    <Portal isOpen={isOpen}>
      <BlurView
        intensity={10}
        tint="default"
        style={{
          flex: 1,
          paddingTop: safeAreaInsets.top,
          paddingBottom: safeAreaInsets.bottom,
        }}
      >
        <VStack
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
          space="lg"
        >
          <Image
            alt={image.fileName}
            source={{
              uri: image.uri,
            }}
            contentFit="cover"
            style={{
              width: "100%",
              flex: 1,
              backgroundColor: "#0553",
            }}
          ></Image>
          <Box>
            <Button onPress={onClose} size="md">
              <ButtonIcon as={CloseIcon} />
            </Button>
          </Box>
        </VStack>
      </BlurView>
    </Portal>
  );
};

export default ImagePreviewModal;
