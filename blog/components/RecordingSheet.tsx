import { StyleSheet } from "react-native";
import React, { forwardRef, useEffect, useState } from "react";
import BottomSheet, {
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import {
  BottomSheetBackdrop,
  BottomSheetDragIndicator,
} from "./ui/bottomsheet";
import { VStack } from "./ui/vstack";
import { Audio } from "expo-av";
import { Button, ButtonIcon, ButtonText } from "./ui/button";
import { RecordingStatus } from "expo-av/build/Audio";
import { Text } from "./ui/text";
import Animated, {
  useSharedValue,
  useDerivedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  BounceInDown,
  FadeIn,
} from "react-native-reanimated";
import {
  CirclePauseIcon,
  CirclePlayIcon,
  CircleX,
  MicIcon,
  MicOffIcon,
} from "lucide-react-native";
import { HStack } from "./ui/hstack";

const AudioWave = ({ metering }: any) => {
  const height = useSharedValue<number>(0);

  useDerivedValue(() => {
    height.value = metering;
  });

  const animatedStyle = useAnimatedStyle(() => {
    const value = interpolate(
      height.value,
      [-160, 0],
      [0, 32],
      Extrapolation.CLAMP
    );
    return {
      height: value,
    };
  });

  return (
    <Animated.View
      entering={BounceInDown}
      className="w-1 h-9 rounded-md bg-indicator-info"
      style={[animatedStyle]}
    />
  );
};

const RecordingSheet = forwardRef(({ onSuccessed }: any, ref: any) => {
  const [recording, setRecording] = useState<any>();
  const [recordingStatus, setRecordingStatus] = useState<any>();
  const [audioPermission, requestAudioPermission] = Audio.usePermissions();
  const [durationMillis, setDurationMillis] = useState<any>();
  const [meterings, setMeterings] = useState<any>([]);
  const [sound, setSound] = useState<any>();

  const onRecordingStatusUpdate = (status: RecordingStatus) => {
    console.log(status);
    if (status.canRecord) {
      setDurationMillis(status.durationMillis);
      setMeterings((prev: any) => [...prev, status.metering]);
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

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording, status } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
        onRecordingStatusUpdate
      );
      setDurationMillis(0);
      setMeterings([]);
      setRecording(recording);
      setRecordingStatus(status);
      console.log("Recording started", status);
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  }

  async function stopRecording() {
    console.log("Stopping recording..");
    const status = await recording.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });
    setRecordingStatus(status);

    const uri = recording.getURI();
    console.log("Recording stopped and stored at", uri);
  }

  async function resetRecording() {
    setDurationMillis(0);
    setMeterings([]);
    setRecording(null);
    setRecordingStatus(null);
  }

  async function playRecording() {
    const uri = recording?.getURI();
    if (uri) {
      const { sound } = await Audio.Sound.createAsync({ uri });
      setSound(sound);
      console.log("Playing Sound");
      await sound.playAsync();
    }
  }

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
      snapPoints={["50%"]}
      backdropComponent={BottomSheetBackdrop}
      handleComponent={BottomSheetDragIndicator}
      ref={ref}
    >
      <BottomSheetView className="flex-1">
        <VStack className="flex-1 items-center p-4" space="2xl">
          <HStack className="justify-start items-center" space="md">
            {!recordingStatus?.isRecording ? (
              <Button size="md" action="primary" onPress={startRecording}>
                <ButtonIcon as={MicOffIcon} />
                <ButtonText>停止中</ButtonText>
              </Button>
            ) : (
              <Button size="md" action="positive" onPress={stopRecording}>
                <ButtonIcon as={MicIcon} />
                <ButtonText>录音中</ButtonText>
              </Button>
            )}
            <Animated.View className="flex-1 flex-row h-10 bg-background-50 rounded-3xl justify-start items-center overflow-hidden">
              <Animated.View entering={FadeIn} style={[styles.waveContent]}>
                {meterings.map((wave: any, index: number) => (
                  <AudioWave key={index} metering={wave} />
                ))}
              </Animated.View>
            </Animated.View>
            <Text size="sm">{formatTime(durationMillis)}</Text>
          </HStack>
          <HStack className="justify-end" space="md">
            <Button
              action="secondary"
              size="sm"
              onPress={playRecording}
              disabled={recordingStatus?.isRecording || !recording}
            >
              <ButtonIcon as={CirclePlayIcon} size="md" />
            </Button>
            <Button
              action="secondary"
              size="sm"
              onPress={() => {}}
              disabled={recordingStatus?.isRecording || !recording}
            >
              <ButtonIcon as={CirclePauseIcon} size="md" />
            </Button>
            <Button
              size="sm"
              action="negative"
              onPress={resetRecording}
              disabled={recordingStatus?.isRecording || !recording}
            >
              <ButtonIcon as={CircleX} size="md" />
            </Button>
          </HStack>
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
