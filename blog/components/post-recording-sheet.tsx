import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetFooter,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { Audio } from 'expo-av';
import { Recording, RecordingStatus } from 'expo-av/build/Audio';
import { Check, Mic, MicOff, PauseCircle, RotateCcw } from 'lucide-react-native';
import moment from 'moment';
import React, { forwardRef, useCallback, useState } from 'react';
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
import colors from 'tailwindcss/colors';
import { Button, ButtonIcon, ButtonText } from './ui/button';
import { Heading } from './ui/heading';
import { HStack } from './ui/hstack';

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
            backgroundColor: colors.red[200],
          },
          ringStyle,
        ]}></Animated.View>
    </Animated.View>
  );
};

const PostRecordingSheet = forwardRef(function RecordingSheet({ onChange }: any, ref: any) {
  const [recording, setRecording] = useState<Recording | null>();
  const [recordingStatus, setRecordingStatus] = useState<any>();
  const [audioPermission, requestAudioPermission] = Audio.usePermissions();
  const insets = useSafeAreaInsets();
  const metering = useSharedValue<number>(0);
  const [durationMillis, setDurationMillis] = useState<number>(0);

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
    console.log('reset...');
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
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        {...props}
        pressBehavior="none"
      />
    ),
    [],
  );

  const renderFooter = useCallback(
    (props: any) => {
      return (
        <BottomSheetFooter {...props}>
          <HStack className="flex-1 bg-gray-50 p-2 items-center justify-around">
            <TouchableOpacity
              className="h-24 w-24 items-center justify-center rounded-full bg-red-500"
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
              variant="link"
              isDisabled={!recordingStatus || !recordingStatus.isRecording}
              onPress={pauseRecording}>
              <ButtonIcon as={PauseCircle} />
              <ButtonText>暂停</ButtonText>
            </Button>
            <Button
              variant="link"
              isDisabled={!recordingStatus || recordingStatus.isRecording}
              onPress={resetRecording}>
              <ButtonIcon as={RotateCcw} />
              <ButtonText>重置</ButtonText>
            </Button>
            <Button
              variant="link"
              isDisabled={!recordingStatus || recordingStatus?.isRecording}
              onPress={commitRecording}
              action="primary">
              <ButtonIcon as={Check} />
              <ButtonText>确定</ButtonText>
            </Button>
          </HStack>
        </BottomSheetFooter>
      );
    },
    [doRecording, recordingStatus, metering, pauseRecording, resetRecording, commitRecording],
  );

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={['50%']}
      enableDynamicSizing={false}
      enablePanDownToClose={true}
      topInset={insets.top}
      bottomInset={insets.bottom}
      backdropComponent={renderBackdrop}
      footerComponent={renderFooter}
      onClose={resetRecording}>
      <BottomSheetView className="m-4 items-center">
        <Heading size="4xl" className="mt-12">
          {moment.utc(durationMillis).format('mm:ss')}
        </Heading>
      </BottomSheetView>
    </BottomSheet>
  );
});

export default PostRecordingSheet;
