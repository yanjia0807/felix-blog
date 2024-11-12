import { TouchableOpacity } from 'react-native';
import React, { forwardRef, useCallback, useState } from 'react';
import {
  BottomSheetBackdrop,
  BottomSheetFooter,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { Audio } from 'expo-av';
import { Recording, RecordingStatus } from 'expo-av/build/Audio';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  withSpring,
  BounceIn,
  BounceOut,
} from 'react-native-reanimated';
import { Mic, MicOff } from 'lucide-react-native';
import { HStack } from './ui/hstack';
import { Heading } from './ui/heading';
import { Button, ButtonText } from './ui/button';
import moment from 'moment';
import colors from 'tailwindcss/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

const RecordingSheet = forwardRef(({ onChange }: any, ref: any) => {
  const [recording, setRecording] = useState<Recording | null>();
  const [recordingStatus, setRecordingStatus] = useState<any>();
  const [audioPermission, requestAudioPermission] = Audio.usePermissions();
  const [snapPoints, setSnapPoints] = useState<any>(['50%']);
  const { bottom: bottomSafeArea } = useSafeAreaInsets();
  const metering = useSharedValue<number>(0);
  const [durationMillis, setDurationMillis] = useState<number>(0);

  const stopRecording = async () => {
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
  };

  const pauseRecording = async () => {
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
  };

  const resumeRecording = async () => {
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
  };

  const resetRecording = async () => {
    console.log('reset...');
    if (recordingStatus && !recordingStatus.isDoneRecording) {
      await stopRecording();
    }
    setRecording(null);
    setRecordingStatus(null);
    setDurationMillis(0);
    metering.value = 0;
  };

  const commitRecording = async () => {
    onChange({ recording, durationMillis });
    ref.current?.close();
  };

  const onRecordingStatusUpdate = (status: RecordingStatus) => {
    // console.log("update...", status);
    if (status.isRecording) {
      metering.value = status.metering || -160;
    }

    if (status.isDoneRecording !== true) {
      setDurationMillis(status.durationMillis);
    }
  };

  const startRecording = async () => {
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
  };

  const doRecording = async () => {
    if (audioPermission && audioPermission.status !== 'granted') {
      console.log('Requesting audio permission..');
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
  };

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
      console.log('renderFooter');
      return (
        <BottomSheetFooter {...props} bottomInset={bottomSafeArea}>
          <HStack className="flex-1 items-center justify-around">
            <TouchableOpacity
              className="h-32 w-32 items-center justify-center rounded-full bg-red-400"
              onPress={doRecording}>
              {recordingStatus?.isRecording ? (
                <>
                  <AnimatedRing metering={metering} />
                  <MicOff size={36} color="white" />
                </>
              ) : (
                <Mic size={36} color="white" />
              )}
            </TouchableOpacity>
            <Button
              isDisabled={!recordingStatus || !recordingStatus.isRecording}
              onPress={pauseRecording}>
              <ButtonText>暂停</ButtonText>
            </Button>
            <Button
              isDisabled={!recordingStatus || recordingStatus.isRecording}
              onPress={resetRecording}>
              <ButtonText>重置</ButtonText>
            </Button>
            <Button
              isDisabled={!recordingStatus || recordingStatus?.isRecording}
              onPress={commitRecording}
              action="primary"
              variant="solid">
              <ButtonText>确定</ButtonText>
            </Button>
          </HStack>
        </BottomSheetFooter>
      );
    },
    [recordingStatus, recording],
  );

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      backdropComponent={renderBackdrop}
      footerComponent={renderFooter}
      onDismiss={() => {
        resetRecording();
      }}>
      <BottomSheetView className="items-center justify-center p-4">
        <Heading size="4xl" className="my-8">
          {moment.utc(durationMillis).format('mm:ss')}
        </Heading>
      </BottomSheetView>
    </BottomSheetModal>
  );
});

export default RecordingSheet;
