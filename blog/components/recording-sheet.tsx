import { TouchableOpacity, View } from "react-native";
import React, {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  BottomSheetBackdropProps,
  BottomSheetBackdrop,
  BottomSheetFooter,
  BottomSheetModal,
  BottomSheetView,
  BottomSheetFlashList,
} from "@gorhom/bottom-sheet";
import { Audio } from "expo-av";
import { Recording, RecordingStatus } from "expo-av/build/Audio";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  withSpring,
  FadeIn,
  FadeOut,
  BounceIn,
  BounceOut,
} from "react-native-reanimated";
import { Mic, MicOff } from "lucide-react-native";
import { HStack } from "./ui/hstack";
import { Heading } from "./ui/heading";
import { Button, ButtonText } from "./ui/button";
import moment from "moment";
import colors from "tailwindcss/colors";

const SheetFooter = memo(
  ({
    recordingStatus,
    pauseRecording,
    resetRecording,
    commitRecording,
    doRecording,
    metering,
  }: any) => (
    <HStack className="flex-1 justify-around items-center">
      <RecordingBtn
        doRecording={doRecording}
        recordingStatus={recordingStatus}
        metering={metering}
      />
      <Button
        isDisabled={!recordingStatus || !recordingStatus.isRecording}
        onPress={pauseRecording}
      >
        <ButtonText>暂停</ButtonText>
      </Button>
      <Button
        isDisabled={!recordingStatus || recordingStatus.isRecording}
        onPress={resetRecording}
      >
        <ButtonText>重置</ButtonText>
      </Button>

      <Button
        isDisabled={!recordingStatus || recordingStatus?.isRecording}
        onPress={commitRecording}
        action="primary"
        variant="solid"
      >
        <ButtonText>确定</ButtonText>
      </Button>
    </HStack>
  )
);

const Ring = ({ metering }: any) => {
  const ring = useSharedValue(metering);

  const ringStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(ring.value, [-160, 0], [0, 1]),
      transform: [
        {
          scale: interpolate(ring.value, [-160, 0], [0.5, 0.8]),
        },
      ],
    };
  });

  useEffect(() => {
    ring.value = withSpring(metering, {
      mass: 1,
      damping: 10,
      stiffness: 100,
      overshootClamping: false,
      restDisplacementThreshold: 0.01,
      restSpeedThreshold: 2,
    });
  }, [metering]);

  return (
    <Animated.View
      entering={BounceIn}
      exiting={BounceOut}
      style={{ position: "absolute" }}
    >
      <Animated.View
        style={[
          {
            width: 128,
            height: 128,
            borderRadius: 64,
            backgroundColor: colors.red[200],
          },
          ringStyle,
        ]}
      ></Animated.View>
    </Animated.View>
  );
};

// const Wave = ({ metering }: any) => {
//   const wave = useSharedValue(metering);
//   useEffect(() => {
//     wave.value = withSpring(metering, {
//       mass: 1,
//       damping: 10,
//       stiffness: 100,
//       overshootClamping: false,
//       restDisplacementThreshold: 0.01,
//       restSpeedThreshold: 2,
//     });
//   }, [metering]);

//   const waveStyle = useAnimatedStyle(() => {
//     return {
//       height: interpolate(wave.value, [-160, 0], [0, 180]),
//     };
//   });

//   return (
//     <Animated.View
//       entering={BounceIn}
//       exiting={BounceOut}
//       style={[
//         {
//           width: 8,
//           margin: 2,
//           height: 80,
//           borderRadius: 10,
//           backgroundColor: colors.red[200],
//         },
//         waveStyle,
//       ]}
//     />
//   );
// };

// const Waveforms = ({ meterings }: any) => {
//   const flashListRef = useRef<any>();

//   const renderItem = ({ item }: any) => {
//     return <Wave metering={item} />;
//   };

//   const onEndReached = () => {
//     flashListRef.current?.scrollToEnd();
//   };

//   return (
//     <BottomSheetView
//       style={{
//         flexDirection: "row",
//         width: "100%",
//         height: 80,
//         borderRadius: 10,
//       }}
//     >
//       <BottomSheetFlashList
//         ref={flashListRef}
//         horizontal={true}
//         data={meterings}
//         renderItem={renderItem}
//         keyExtractor={(_, index) => index.toString()}
//         estimatedItemSize={8}
//         showsHorizontalScrollIndicator={false}
//         onEndReached={() => onEndReached()}
//         onEndReachedThreshold={6}
//       ></BottomSheetFlashList>
//     </BottomSheetView>
//   );
// };

const RecordingBtn = memo(({ doRecording, recordingStatus, metering }: any) => {
  return (
    <TouchableOpacity
      className="justify-center items-center w-32 h-32 rounded-full bg-red-500"
      onPress={doRecording}
    >
      {recordingStatus?.isRecording ? (
        <>
          <Ring metering={metering} />
          <MicOff size={36} color="white" />
        </>
      ) : (
        <Mic size={36} color="white" />
      )}
    </TouchableOpacity>
  );
});

const RecordingSheet = forwardRef(({ setRecordings }: any, ref: any) => {
  const [currentRecording, setCurrentRecording] = useState<Recording | null>();
  const [recordingStatus, setRecordingStatus] = useState<any>();
  const [audioPermission, requestAudioPermission] = Audio.usePermissions();
  const [durationMillis, setDurationMillis] = useState<number>(0);
  const [snapPoints, setSnapPoints] = useState<any>(["40%"]);
  const [metering, setMetering] = useState<number>(0);
  const [meterings, setMeterings] = useState<number[]>([]);

  const onRecordingStatusUpdate = (status: RecordingStatus) => {
    console.log("update...", status);
    if (status.isRecording) {
      setMetering(status.metering || -160);
      setMeterings((prev) => [...prev, status.metering || -160]);
      setDurationMillis(status.durationMillis);
    }
  };

  const resetRecording = useCallback(async () => {
    console.log("reset...");
    if (recordingStatus && !recordingStatus.isDoneRecording) {
      await stopRecording();
    }
    setCurrentRecording(null);
    setRecordingStatus(null);
    setMetering(0);
    setMeterings([]);
    setDurationMillis(0);
  }, [recordingStatus]);

  const startRecording = useCallback(async () => {
    console.log("starting...");
    try {
      await resetRecording();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording, status } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
        onRecordingStatusUpdate
      );
      setCurrentRecording(recording);
      setRecordingStatus({
        canRecord: status.canRecord,
        isRecording: status.isRecording,
        isDoneRecording: status.isDoneRecording,
      });
      setDurationMillis(status.durationMillis);
      console.log("started", status);
    } catch (error) {
      console.error("failed to start", error);
    }
  }, []);

  const stopRecording = useCallback(async () => {
    try {
      if (currentRecording) {
        console.log("stopping...");
        const status = await currentRecording.stopAndUnloadAsync();
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
        });

        setRecordingStatus({
          canRecord: status.canRecord,
          isRecording: status.isRecording,
          isDoneRecording: status.isDoneRecording,
        });
        console.log("stopped", status, currentRecording?.getURI());
      }
    } catch (error) {
      console.error("failed to stop", error);
    }
  }, [currentRecording]);

  const pauseRecording = useCallback(async () => {
    try {
      if (currentRecording) {
        console.log("pausing...");
        const status = await currentRecording.pauseAsync();
        setRecordingStatus({
          canRecord: status.canRecord,
          isRecording: status.isRecording,
          isDoneRecording: status.isDoneRecording,
        });
        console.log("paused", status);
      }
    } catch (err) {
      console.error("failed to pause", err);
    }
  }, [currentRecording]);

  const resumeRecording = useCallback(async () => {
    if (currentRecording) {
      try {
        console.log("resuming...");
        const status = await currentRecording.startAsync();
        setRecordingStatus({
          canRecord: status.canRecord,
          isRecording: status.isRecording,
          isDoneRecording: status.isDoneRecording,
        });
        console.log("resumed", status);
      } catch (err) {
        console.error("failed to resume", err);
      }
    }
  }, [currentRecording]);

  const doRecording = useCallback(async () => {
    if (audioPermission && audioPermission.status !== "granted") {
      console.log("Requesting audio permission..");
      await requestAudioPermission();
    }

    if (!recordingStatus?.canRecord) {
      startRecording();
    } else {
      if (!recordingStatus.isRecording) {
        resumeRecording();
      } else {
        stopRecording();
      }
    }
  }, [recordingStatus]);

  const commitRecording = useCallback(async () => {
    setRecordings((pre: any) => [...pre, currentRecording]);
    await resetRecording();
    ref.current?.close();
  }, [currentRecording]);

  const renderFooter = useCallback(
    ({ doRecording, recordingStatus, metering, ...props }: any) => (
      <BottomSheetFooter {...props} bottomInset={24}>
        <SheetFooter
          recordingStatus={recordingStatus}
          pauseRecording={pauseRecording}
          resetRecording={resetRecording}
          commitRecording={commitRecording}
          doRecording={doRecording}
          metering={metering}
        />
      </BottomSheetFooter>
    ),
    [recordingStatus, pauseRecording, resetRecording, commitRecording]
  );

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} pressBehavior="none" />
    ),
    []
  );

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      backdropComponent={renderBackdrop}
      footerComponent={(props) =>
        renderFooter({ doRecording, recordingStatus, metering, ...props })
      }
    >
      <BottomSheetView className="p-4 justify-center items-center">
        <Heading size="4xl" className="my-8">
          {moment.utc(durationMillis).format("mm:ss")}
        </Heading>
        {/* <Waveforms meterings={meterings} /> */}
      </BottomSheetView>
    </BottomSheetModal>
  );
});

export default RecordingSheet;
