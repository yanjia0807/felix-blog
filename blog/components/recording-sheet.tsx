import { StyleSheet, TouchableOpacity } from "react-native";
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  BottomSheetFooter,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import {
  BottomSheetBackdrop,
  BottomSheetDragIndicator,
} from "./ui/bottomsheet";
import { VStack } from "./ui/vstack";
import { Audio } from "expo-av";
import { Recording, RecordingStatus } from "expo-av/build/Audio";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  SlideInRight,
  ZoomIn,
  withTiming,
  ReduceMotion,
} from "react-native-reanimated";
import { Mic, MicOff, Pause, Play, RotateCcw } from "lucide-react-native";
import { HStack } from "./ui/hstack";
import { Heading } from "./ui/heading";
import { Box } from "./ui/box";
import { BottomSheetDefaultFooterProps } from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheetFooter/types";
import { Button, ButtonText } from "./ui/button";

const RecordingSheet = forwardRef(({ setRecording }: any, ref: any) => {
  const [currentRecording, setCurrentRecording] = useState<Recording | null>();
  const [recordingStatus, setRecordingStatus] =
    useState<RecordingStatus | null>();
  const [audioPermission, requestAudioPermission] = Audio.usePermissions();
  const [sound, setSound] = useState<any>();
  const width = useSharedValue(10);
  const [temp, setTemp] = useState([0]);
  const tempRef = useRef({ temp: [0] });

  const customEasing = (value: number) => {
    "worklet";
    return value;
  };

  const style = useAnimatedStyle(() => {
    return {
      width: withTiming(
        width.value,
        {
          duration: 100,
          easing: customEasing,
          reduceMotion: ReduceMotion.Never,
        },
        () => {}
      ),
    };
  });

  const onRecordingStatusUpdate = (status: RecordingStatus) => {
    console.log(status);
    if (status.isRecording) {
      const temp1 = [
        ...tempRef?.current.temp,
        (status.metering || 0 + 70) * 1.2,
      ];
      tempRef.current.temp = temp1;
      setTemp(temp1);
      setRecordingStatus(status);
      width.value = width.value + 10 + 5;
    }
  };

  const formatTime = function (time: number) {
    let min = "00",
      sec = "00";
    if (time) {
      const minutes = Math.floor(time / 60);
      const seconds = time % 60;
      min = minutes < 10 ? `0${minutes}` : `${minutes}`;
      sec = seconds < 10 ? `0${seconds}` : `${seconds}`;
    }
    return `${min}:${sec}`;
  };

  async function startRecording() {
    try {
      if (audioPermission && audioPermission.status !== "granted") {
        console.log("Requesting audio permission..");
        await requestAudioPermission();
      }

      if (!currentRecording) {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });

        const { recording, status } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY,
          onRecordingStatusUpdate,
          0.1
        );

        setRecordingStatus(status);
        setCurrentRecording(recording);
        console.log("Recording started", status);
      } else {
        currentRecording.startAsync();
      }
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  }

  async function pauseRecording() {
    try {
      if (currentRecording) {
        const recordingStatus = await currentRecording.getStatusAsync();
        if (recordingStatus.isRecording) {
          const status = await currentRecording.pauseAsync();
          setRecordingStatus(status);
          console.log("Recording paused", status);
        }
      }
    } catch (err) {
      console.error("Failed to pause recording", err);
    }
  }

  async function stopRecording() {
    console.log("Stopping recording..");
    const status = await currentRecording?.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });
    setRecordingStatus(status);

    const uri = currentRecording?.getURI();
    console.log("Recording stopped and stored at", uri);
  }

  async function resetRecording() {
    console.log(recordingStatus);
    if (!recordingStatus?.isRecording) {
      setCurrentRecording(null);
      setRecordingStatus(null);
      tempRef.current = { temp: [0] };
      setTemp([0]);
      const status = await currentRecording?.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      console.log("Recording reseted", status);
    }
  }

  async function playRecording() {
    const uri = currentRecording?.getURI();
    if (uri) {
      const { sound } = await Audio.Sound.createAsync({ uri });
      setSound(sound);
      console.log("Playing Sound");
      await sound.playAsync();
    }
  }

  const renderFooter = useCallback(
    (props: BottomSheetDefaultFooterProps) => (
      <BottomSheetFooter {...props} bottomInset={24}>
        <HStack className="flex-1 justify-around items-center">
          <Button isDisabled={!recordingStatus?.isDoneRecording}>
            <ButtonText>确定</ButtonText>
          </Button>
          <Button
            isDisabled={recordingStatus?.isRecording}
            onPress={resetRecording}
          >
            <ButtonText>重置</ButtonText>
          </Button>
        </HStack>
      </BottomSheetFooter>
    ),
    []
  );

  useEffect(() => {
    return sound
      ? () => {
          console.log("Unloading Sound");
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  return (
    <BottomSheetModal
      index={0}
      snapPoints={["50%"]}
      backdropComponent={BottomSheetBackdrop}
      handleComponent={BottomSheetDragIndicator}
      ref={ref}
      footerComponent={renderFooter}
    >
      <BottomSheetView className="flex-1">
        <VStack className="flex-1 p-4">
          <VStack className="justify-start items-center" space="md">
            <Heading size="lg">
              {formatTime(recordingStatus?.durationMillis)}
            </Heading>
            <Animated.View
              style={{
                backgroundColor: "bg-red-400",
                height: "40%",
                display: "flex",
                flexDirection: "row-reverse",
                alignItems: "center",
              }}
            >
              <Animated.View
                entering={SlideInRight}
                style={[
                  {
                    display: "flex",
                    flexDirection: "row",
                    paddingHorizontal: 16,
                    overflow: "hidden",
                    backgroundColor: "white",
                    gap: 10,
                    alignItems: "center",
                  },
                  style,
                ]}
              >
                {temp.map((t, index) => {
                  return (
                    <Animated.View
                      key={index}
                      entering={ZoomIn}
                      style={{
                        height: t > 10 ? t : 10,
                        width: 5,
                        borderRadius: 200,
                        backgroundColor: "black",
                      }}
                    />
                  );
                })}
              </Animated.View>
            </Animated.View>
            <HStack className="items-center" space="xl">
              <TouchableOpacity
                className="justify-center items-center w-12 h-12 rounded-full bg-red-500"
                onPress={playRecording}
              >
                <Play size={16} color="white" />
              </TouchableOpacity>
              <Box className="w-28 h-28 justify-center items-center">
                <TouchableOpacity
                  className="justify-center items-center w-20 h-20 rounded-full bg-red-500"
                  onPress={startRecording}
                >
                  <Mic size={32} color="white" />
                </TouchableOpacity>
                <TouchableOpacity
                  className="absolute bottom-0 right-0 justify-center items-center w-12 h-12 rounded-full bg-gray-500"
                  onPress={pauseRecording}
                >
                  <Pause size={16} color="white" />
                </TouchableOpacity>
              </Box>
              <TouchableOpacity
                className="justify-center items-center w-12 h-12 rounded-full bg-red-500"
                onPress={stopRecording}
              >
                <RotateCcw size={16} color="white" />
              </TouchableOpacity>
            </HStack>
          </VStack>
        </VStack>
      </BottomSheetView>
    </BottomSheetModal>
  );
});

const styles = StyleSheet.create({
  waveContent: {
    display: "flex",
    flexDirection: "row",
    overflow: "hidden",
    alignItems: "center",
  },
});
export default RecordingSheet;
