import React, { useRef, useState } from "react";
import { TouchableOpacity } from "react-native";
import _ from "lodash";
import {
  AlertCircleIcon,
  CircleX,
  MapPinIcon,
  PaperclipIcon,
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

  return (
    <>
      {!cameraViewIsOpen && (
        <>
          <VStack space="md" reversed={false} className="p-4">
            <FormControl
              size="md"
              isDisabled={false}
              isReadOnly={false}
              isRequired={false}
            >
              <Textarea
                size="md"
                isReadOnly={false}
                isInvalid={false}
                isDisabled={false}
                className="w-full"
              >
                <TextareaInput placeholder="你此时的感想..." />
              </Textarea>
              <FormControlHelper>
                <FormControlHelperText>
                  至少需要输入6个字符
                </FormControlHelperText>
              </FormControlHelper>
              <FormControlError>
                <FormControlErrorIcon as={AlertCircleIcon} />
                <FormControlErrorText>至少需要输入6个字符</FormControlErrorText>
              </FormControlError>
            </FormControl>
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
                onPress={() => setMediaSheetIsOpen(true)}
              >
                <ButtonIcon as={PaperclipIcon} />
                <ButtonText>媒体</ButtonText>
              </Button>
            </HStack>

            <Divider className="my-2 bg-background-200" />
            <HStack space="md" className="flex-wrap">
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
          <RecordingSheet
            onSuccessed={handleRecordingSuccessed}
            ref={recordingSheetRef}
          />
        </>
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
