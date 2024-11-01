import React, { useRef, useState } from "react";
import { TouchableOpacity } from "react-native";
import _ from "lodash";
import {
  AlertCircleIcon,
  CircleX,
  MapPinIcon,
  PaperclipIcon,
  TagIcon,
} from "lucide-react-native";
import { Audio } from "expo-av";
import { useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import {
  FormControl,
  FormControlHelper,
  FormControlHelperText,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
} from "@/components/ui/form-control";
import { VStack } from "@/components/ui/vstack";
import { Box } from "@/components/ui/box";
import { Textarea, TextareaInput } from "@/components/ui/textarea";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import MeidaPickerSheet from "@/components/MeidaPickerSheet";
import CameraVIew from "@/components/CameraVIew";
import RecordingSheet from "@/components/RecordingSheet";
import { Divider } from "@/components/ui/divider";
import ImagePreviewModal from "@/components/ImagePreviewModal";
import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
import { Image } from "@/components/ui/image";
import LocationSheet from "@/components/LocationSheet";
import TagSheet from "@/components/TagSheet";

const BlogCreate = () => {
  const [mediaSheetIsOpen, setMediaSheetIsOpen] = React.useState(false);
  const handleMediaSheetClose = () => setMediaSheetIsOpen(false);

  const [cameraViewIsOpen, setCameraViewIsOpen] = React.useState(false);

  const [imagePreviewModalIsOpen, setImagePreviewModalIsOpen] =
    React.useState(false);
  const handleImagePreviewModalClose = () => setImagePreviewModalIsOpen(false);

  const [currentPreviewImage, setCurrentPreviewImage] = React.useState(null);

  const [images, setImages] = useState<any>([]);

  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [audioPermission, requestAudioPermission] = Audio.usePermissions();

  const handlePressImage = async () => {
    handleMediaSheetClose();
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: true,
      selectionLimit: 9,
      aspect: [4, 3],
      quality: 1,
    });
    console.log(result);
    if (!result.canceled) {
      setImages((pre: any) => _.unionBy(pre, result.assets, "assetId"));
    }
  };

  const handleRemoveImage = async (assetId: string) => {
    setImages((pre: any) => _.filter(pre, (item) => item.assetId !== assetId));
  };

  const handlePreviewImage = async (image: any) => {
    setCurrentPreviewImage(image);
    setImagePreviewModalIsOpen(true);
  };

  const handlePressCamera = async () => {
    if (cameraPermission && !cameraPermission.granted) {
      const result = await requestCameraPermission();
      console.log(result);
      if (result.granted) {
        setCameraViewIsOpen(true);
      }
    }
  };

  const recordingSheetRef = useRef<BottomSheetModal>();
  const handlePressRecording = async () => {
    console.log("handlePressRecording");
    handleMediaSheetClose();
    recordingSheetRef.current?.present();
  };

  const handleRecordingSuccessed = async () => {};

  const locationSheetRef = useRef<BottomSheetModal>();

  const handlePressLocation = async () => {
    console.log("handlePressLocation");
    locationSheetRef.current?.present();
  };

  const handleLocationSuccessed = async () => {};

  const tagSheetRef = useRef<BottomSheetModal>();

  const handlePressTag = async () => {
    console.log("handlePressTag");
    tagSheetRef.current?.present();
  };

  return (
    <>
      {!cameraViewIsOpen && (
        <Box className="flex-1 p-4">
          <VStack space="md" className="flex-1">
            <FormControl size="md" className="flex-1">
              <Textarea size="md" className="flex-1 border-0">
                <TextareaInput placeholder="你此时的感想..." />
              </Textarea>
              <FormControlHelper className="justify-end">
                <FormControlHelperText>
                  至少需要输入6个字符
                </FormControlHelperText>
              </FormControlHelper>
              <FormControlError>
                <FormControlErrorIcon as={AlertCircleIcon} />
                <FormControlErrorText>至少需要输入6个字符</FormControlErrorText>
              </FormControlError>
              <HStack reversed={true} space="md">
                <Button
                  size="sm"
                  variant="link"
                  onPress={() => handlePressLocation()}
                >
                  <ButtonIcon as={MapPinIcon} />
                  <ButtonText>位置</ButtonText>
                </Button>
                <Button
                  size="sm"
                  variant="link"
                  onPress={() => handlePressTag()}
                >
                  <ButtonIcon as={TagIcon} />
                  <ButtonText>标签</ButtonText>
                </Button>
                <Button
                  size="sm"
                  variant="link"
                  onPress={() => setMediaSheetIsOpen(true)}
                >
                  <ButtonIcon as={PaperclipIcon} />
                  <ButtonText>媒体</ButtonText>
                </Button>
              </HStack>
              <Divider className="my-2 bg-background-200" />
            </FormControl>
          </VStack>
          <VStack space="md" className="flex-1 justify-between">
            <HStack space="md" className="flex-wrap">
              <TouchableOpacity>
                <Image
                  size="md"
                  alt=""
                  source={require("@/assets/images/sound-ani.gif")}
                  className="rounded-md"
                />
                <TouchableOpacity className="absolute right-0 top-0 m-1">
                  <Icon as={CircleX} size="sm" className=" text-white " />
                </TouchableOpacity>
              </TouchableOpacity>

              {images.map((image: any) => (
                <TouchableOpacity
                  onPress={() => handlePreviewImage(image)}
                  key={image.assetId}
                >
                  <Image
                    size="md"
                    alt={image.fileName}
                    source={{
                      uri: image.uri,
                    }}
                    className="rounded-md"
                  />
                  <TouchableOpacity
                    className="absolute right-0 top-0 m-1"
                    onPress={() => handleRemoveImage(image.assetId)}
                  >
                    <Icon as={CircleX} size="sm" className=" text-white " />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </HStack>
            <VStack>
              <Divider className="bg-background-200" />
              <HStack space="md" reversed={true}>
                <Button
                  className="w-fit self-end mt-4"
                  action="primary"
                  size="md"
                >
                  <ButtonText>发布</ButtonText>
                </Button>
                <Button
                  className="w-fit self-end mt-4"
                  size="md"
                  action="secondary"
                  variant="link"
                >
                  <ButtonText>草稿</ButtonText>
                </Button>
                <Button
                  className="w-fit self-end mt-4"
                  size="md"
                  action="secondary"
                  variant="link"
                >
                  <ButtonText>预览</ButtonText>
                </Button>
              </HStack>
            </VStack>
          </VStack>
          <MeidaPickerSheet
            isOpen={mediaSheetIsOpen}
            onClose={handleMediaSheetClose}
            onPressImage={handlePressImage}
            onPressCamera={handlePressCamera}
            onPressRecording={handlePressRecording}
          />
          <LocationSheet
            onSuccessed={handleLocationSuccessed}
            ref={locationSheetRef}
          />
          <TagSheet ref={tagSheetRef} />
          <RecordingSheet
            onSuccessed={handleRecordingSuccessed}
            ref={recordingSheetRef}
          />
        </Box>
      )}
      <ImagePreviewModal
        image={currentPreviewImage}
        isOpen={imagePreviewModalIsOpen}
        onClose={handleImagePreviewModalClose}
      />
      {cameraViewIsOpen && <CameraVIew />}
    </>
  );
};

export default BlogCreate;
