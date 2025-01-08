import { BottomSheetBackdrop, BottomSheetFooter, BottomSheetModal } from '@gorhom/bottom-sheet';
import { format, intervalToDuration } from 'date-fns';
import { Audio } from 'expo-av';
import { Recording, RecordingStatus } from 'expo-av/build/Audio';
import { Check, Mic, MicOff, PauseCircle, RotateCcw } from 'lucide-react-native';
import React, { forwardRef, useCallback, useMemo, useRef, useState } from 'react';
import { TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  withSpring,
  BounceIn,
  BounceOut,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, ButtonIcon, ButtonText } from './ui/button';
import { Divider } from './ui/divider';
import { Heading } from './ui/heading';
import { HStack } from './ui/hstack';
import { VStack } from './ui/vstack';

const AnimatedRing = ({ metering }: any) => {
  const ringStyle = useAnimatedStyle(() => ({
    opacity: withSpring(interpolate(metering.value, [-100, 0], [0, 1])),
    transform: [
      {
        scale: withSpring(interpolate(metering.value, [-100, 0], [0.5, 1.2])),
      },
    ],
  }));

  return (
    <Animated.View entering={BounceIn} exiting={BounceOut} style={{ position: 'absolute' }}>
      <Animated.View
        style={[
          {
            width: 128,
            height: 128,
            borderRadius: 64,
          },
          ringStyle,
        ]}></Animated.View>
    </Animated.View>
  );
};

export const RecordingInput = ({ onChange }: any) => {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const onInputIconPressed = () => {
    bottomSheetRef.current?.present();
  };

  return (
    <>
      <Button variant="link" action="secondary" onPress={() => onInputIconPressed()}>
        <ButtonIcon as={Mic} />
        <ButtonText>录音</ButtonText>
      </Button>
      <RecordingSheet onChange={onChange} ref={bottomSheetRef} />
    </>
  );
};

export const RecordingSheet = forwardRef(function Sheet({ onChange }: any, ref: any) {
  const [recording, setRecording] = useState<Recording | null>();
  const [recordingStatus, setRecordingStatus] = useState<any>();
  const [audioPermission, requestAudioPermission] = Audio.usePermissions();
  const metering = useSharedValue<number>(0);
  const [durationMillis, setDurationMillis] = useState<number>(0);
  const snapPoints = useMemo(() => ['50%'], []);
  const insets = useSafeAreaInsets();

  const duration = intervalToDuration({ start: 0, end: durationMillis });
  const formattedTime = `${String(duration.minutes).padStart(2, '0')}:${String(duration.seconds).padStart(2, '0')}`;

  const stopRecording = useCallback(async () => {
    try {
      if (recording) {
        console.log('stopping...');
        const status = await recording.stopAndUnloadAsync();
        setRecordingStatus({
          canRecord: status.canRecord,
          isRecording: status.isRecording,
          isDoneRecording: status.isDoneRecording,
        });
        setDurationMillis(status.durationMillis);
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
        });
        console.log('stopped', status);
      }
    } catch (error) {
      console.error('failed to stop', error);
    }
  }, [recording]);

  const pauseRecording = useCallback(async () => {
    try {
      if (recording) {
        console.log('pausing...');
        const status = await recording.pauseAsync();
        setRecordingStatus({
          canRecord: status.canRecord,
          isRecording: status.isRecording,
          isDoneRecording: status.isDoneRecording,
        });
        console.log('paused', status);
      }
    } catch (err) {
      console.error('failed to pause', err);
    }
  }, [recording]);

  const resumeRecording = useCallback(async () => {
    if (recording) {
      try {
        console.log('resuming...');
        const status = await recording.startAsync();
        setRecordingStatus({
          canRecord: status.canRecord,
          isRecording: status.isRecording,
          isDoneRecording: status.isDoneRecording,
        });
        console.log('resumed', status);
      } catch (err) {
        console.error('failed to resume', err);
      }
    }
  }, [recording]);

  const resetRecording = useCallback(async () => {
    if (recordingStatus && !recordingStatus.isDoneRecording) {
      await stopRecording();
    }
    setRecording(null);
    setRecordingStatus(null);
    setDurationMillis(0);
    metering.value = 0;
  }, [metering, recordingStatus, stopRecording]);

  const commitRecording = useCallback(async () => {
    onChange(recording);
    ref.current?.close();
  }, [onChange, recording, ref]);

  const onRecordingStatusUpdate = useCallback(
    (status: RecordingStatus) => {
      if (status.isRecording) {
        metering.value = status.metering || -160;
      }

      if (status.isDoneRecording !== true) {
        setDurationMillis(status.durationMillis);
      }
    },
    [metering],
  );

  const startRecording = useCallback(async () => {
    console.log('starting...');
    try {
      await resetRecording();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording, status } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
        onRecordingStatusUpdate,
      );
      setRecording(recording);
      setRecordingStatus({
        canRecord: status.canRecord,
        isRecording: status.isRecording,
        isDoneRecording: status.isDoneRecording,
      });
      console.log('started', status);
    } catch (error) {
      console.error('failed to start', error);
    }
  }, [onRecordingStatusUpdate, resetRecording]);

  const doRecording = useCallback(async () => {
    if (audioPermission && audioPermission.status !== 'granted') {
      console.log('Requesting audio permission..');
      await requestAudioPermission();
    }

    if (!recordingStatus?.canRecord) {
      startRecording();
    } else {
      if (!recordingStatus?.isRecording) {
        resumeRecording();
      } else {
        stopRecording();
      }
    }
  }, [
    audioPermission,
    recordingStatus?.canRecord,
    recordingStatus?.isRecording,
    requestAudioPermission,
    resumeRecording,
    startRecording,
    stopRecording,
  ]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior={'close'}
      />
    ),
    [],
  );

  const renderFooter = (props: any) => {
    return (
      <BottomSheetFooter {...props} bottomInset={insets.bottom}>
        <HStack className="items-center justify-around bg-background-50 p-2">
          <TouchableOpacity
            className="h-24 w-24 items-center justify-center rounded-full bg-primary-500"
            onPress={doRecording}>
            {recordingStatus?.isRecording ? (
              <>
                <AnimatedRing metering={metering} />
                <MicOff size={32} color="white" />
              </>
            ) : (
              <Mic size={32} color="white" />
            )}
          </TouchableOpacity>
          <Button
            action="secondary"
            isDisabled={!recordingStatus || !recordingStatus.isRecording}
            onPress={pauseRecording}>
            <ButtonIcon as={PauseCircle} />
            <ButtonText>暂停</ButtonText>
          </Button>
          <Button
            action="secondary"
            isDisabled={!recordingStatus || recordingStatus.isRecording}
            onPress={resetRecording}>
            <ButtonIcon as={RotateCcw} />
            <ButtonText>重置</ButtonText>
          </Button>
          <Button
            isDisabled={!recordingStatus || recordingStatus?.isRecording}
            onPress={commitRecording}
            action="primary">
            <ButtonIcon as={Check} />
            <ButtonText>确定</ButtonText>
          </Button>
        </HStack>
      </BottomSheetFooter>
    );
  };

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      enablePanDownToClose={true}
      backdropComponent={renderBackdrop}
      footerComponent={renderFooter}>
      <VStack className="flex-1 bg-background-100 p-4" space="md">
        <VStack className="mb-4 items-center">
          <Heading className="p-2">录音</Heading>
          <Divider />
        </VStack>
        <Heading size="4xl" className="self-center">
          {formattedTime}
        </Heading>
      </VStack>
    </BottomSheetModal>
  );
});
