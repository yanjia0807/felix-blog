import React, { useRef, useState } from "react";
import { Keyboard, TouchableOpacity } from "react-native";
import _ from "lodash";
import {
  AlertCircleIcon,
  CircleX,
  ImageIcon,
  MapPinIcon,
  Mic,
  TagIcon,
} from "lucide-react-native";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { Image } from "expo-image";
import { router, Stack } from "expo-router";
import {
  FormControl,
  FormControlHelper,
  FormControlHelperText,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
} from "@/components/ui/form-control";
import { Textarea, TextareaInput } from "@/components/ui/textarea";
import {
  Button,
  ButtonGroup,
  ButtonIcon,
  ButtonText,
} from "@/components/ui/button";
import ImagePickerSheet from "@/components/image-picker-sheet";
import RecordingSheet from "@/components/recording-sheet";
import { Divider } from "@/components/ui/divider";
import GalleryPreview from "react-native-gallery-preview";
import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
import LocationSheet from "@/components/location-sheet";
import TagSheet from "@/components/tag-sheet";
import { Grid, GridItem } from "@/components/ui/grid";
import {
  KeyboardAwareScrollView,
  KeyboardToolbar,
} from "react-native-keyboard-controller";

const PostCreate = () => {
  const [images, setImages] = useState<any>([]);
  const [recording, setRecording] = useState<any>();
  const [location, setLocation] = useState<any>();
  const [tags, setTags] = useState<any>([]);

  const [initialIndex, setInitialIndex] = useState<number>(0);
  const [imageSheetIsOpen, setImageSheetIsOpen] = useState(false);
  const [galleryPreviewIsOpen, setGalleryPreviewIsOpen] = useState(false);
  const recordingSheetRef = useRef<BottomSheetModal>();
  const locationSheetRef = useRef<BottomSheetModal>();
  const tagSheetRef = useRef<BottomSheetModal>();

  const handleRemoveImage = async (assetId: string) => {
    setImages((pre: any) => _.filter(pre, (item) => item.assetId !== assetId));
  };

  const handleOpenGallery = async (index: number) => {
    setInitialIndex(index);
    setGalleryPreviewIsOpen(true);
  };

  return (
    <>
      <ImagePickerSheet
        isOpen={imageSheetIsOpen}
        onClose={() => {
          setImageSheetIsOpen(false);
        }}
        setImages={setImages}
      />
      <RecordingSheet ref={recordingSheetRef} setRecording={setRecording} />
      <LocationSheet ref={locationSheetRef} setLocation={setLocation} />
      <TagSheet ref={tagSheetRef} setTags={setTags} />

      <GalleryPreview
        images={images}
        initialIndex={initialIndex}
        isVisible={galleryPreviewIsOpen}
        onRequestClose={() => setGalleryPreviewIsOpen(false)}
      />

      <Stack.Screen
        options={{
          title: "记录",
          headerShown: true,
          headerLeft: () => (
            <Button
              size="sm"
              action="secondary"
              variant="link"
              onPress={() => {
                router.dismiss();
              }}
            >
              <ButtonText>返回</ButtonText>
            </Button>
          ),
          headerRight: () => (
            <HStack space="sm">
              <Button size="sm" action="secondary" variant="link">
                <ButtonText>[存草稿]</ButtonText>
              </Button>
              <Button action="primary" size="sm" variant="link">
                <ButtonText>发布</ButtonText>
              </Button>
            </HStack>
          ),
        }}
      />
      <KeyboardAwareScrollView
        bottomOffset={62}
        contentContainerStyle={{ flex: 1, padding: 16 }}
      >
        <FormControl size="md" className="h-52">
          <Textarea size="md" className="flex-1 border-0">
            <TextareaInput placeholder="你此时的感想..." />
          </Textarea>
          <FormControlHelper className="justify-end">
            <FormControlHelperText>至少需要输入6个字符</FormControlHelperText>
          </FormControlHelper>
          <FormControlError>
            <FormControlErrorIcon as={AlertCircleIcon} />
            <FormControlErrorText>至少需要输入6个字符</FormControlErrorText>
          </FormControlError>

          <Divider className="my-2 bg-background-200" />
        </FormControl>
        <Grid
          className="gap-4"
          _extra={{
            className: "grid-cols-12",
          }}
        >
          {images.map((image: any, index: number) => (
            <GridItem
              key={image.assetId}
              _extra={{
                className: "col-span-4",
              }}
            >
              <TouchableOpacity
                onPress={() => handleOpenGallery(index)}
                key={image.assetId}
              >
                <Image
                  alt={image.fileName}
                  style={{
                    aspectRatio: 1,
                    borderRadius: 12,
                  }}
                  source={{
                    uri: image.uri,
                  }}
                />
                <TouchableOpacity
                  className="absolute right-0 top-0 m-1"
                  onPress={() => handleRemoveImage(image.assetId)}
                >
                  <Icon as={CircleX} size="sm" className=" text-white " />
                </TouchableOpacity>
              </TouchableOpacity>
            </GridItem>
          ))}
        </Grid>
      </KeyboardAwareScrollView>
      <KeyboardToolbar
        showArrows={false}
        doneText=""
        content={
          <HStack space="md">
            <ButtonGroup space="xs">
              <Button
                size="sm"
                variant="link"
                onPress={() => setImageSheetIsOpen(true)}
              >
                <ButtonIcon as={ImageIcon} />
                <ButtonText>图片</ButtonText>
              </Button>
            </ButtonGroup>
            <ButtonGroup space="xs">
              <Button
                size="sm"
                variant="link"
                onPress={() => {
                  Keyboard.dismiss();
                  recordingSheetRef.current?.present();
                }}
              >
                <ButtonIcon as={Mic} />
                <ButtonText>录音</ButtonText>
              </Button>
            </ButtonGroup>
            <ButtonGroup space="xs">
              <Button
                size="sm"
                variant="link"
                onPress={() => {
                  Keyboard.dismiss();
                  locationSheetRef.current?.present();
                }}
              >
                <ButtonIcon as={MapPinIcon} />
                <ButtonText>位置</ButtonText>
              </Button>
            </ButtonGroup>
            <ButtonGroup space="xs">
              <Button
                size="sm"
                variant="link"
                onPress={() => {
                  Keyboard.dismiss();
                  tagSheetRef.current?.present();
                }}
              >
                <ButtonIcon as={TagIcon} />
                <ButtonText>标签</ButtonText>
              </Button>
            </ButtonGroup>
          </HStack>
        }
      />
    </>
  );
};

export default PostCreate;
