import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Divider } from '@/components/ui/divider';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import useToast from '@/hooks/use-toast';
import { BottomSheetBackdrop, BottomSheetFooter, BottomSheetModal } from '@gorhom/bottom-sheet';
import { intervalToDuration } from 'date-fns';
import { Check, PauseCircle, RotateCcw } from 'lucide-react-native';
import React, { forwardRef, useCallback, useMemo, useState } from 'react';
import { useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimatedRing } from './animated-ring';

const SELECTION_LIMIT = 5;

export const RecordingSheet = forwardRef(function Sheet({ onChange, value }: any, ref: any) {
  const [recording, setRecording] = useState<Recording | null>();
  const [recordingStatus, setRecordingStatus] = useState<any>();
  const metering = useSharedValue<number>(0);
  const [durationMillis, setDurationMillis] = useState<number>(0);
  const snapPoints = useMemo(() => ['50%'], []);
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const duration: any = intervalToDuration({ start: 0, end: durationMillis });
  const formattedTime = `${String(duration?.minutes || '').padStart(2, '0')}:${String(duration?.seconds || '').padStart(2, '0')}`;

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
    onChange([...value, { ...recording, uri: recording?._uri }]);
    ref.current?.close();
  }, [onChange, recording, ref, value]);

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
    if (value.length === SELECTION_LIMIT) {
      toast.info({ description: `最多只能选择${SELECTION_LIMIT}个` });
      return;
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
    value,
    recordingStatus?.canRecord,
    recordingStatus?.isRecording,
    toast,
    startRecording,
    resumeRecording,
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

  const renderFooter = useCallback(
    (props: any) => {
      console.log('@@renderFooter');
      return (
        <BottomSheetFooter {...props}>
          <HStack
            className="items-center justify-around bg-background-50 p-2"
            style={{ paddingBottom: insets.bottom }}>
            <Button
              variant="link"
              action="secondary"
              isDisabled={!recordingStatus || !recordingStatus.isRecording}
              onPress={pauseRecording}>
              <ButtonIcon as={PauseCircle} />
              <ButtonText>暂停</ButtonText>
            </Button>
            <Button
              variant="link"
              action="secondary"
              isDisabled={!recordingStatus || recordingStatus.isRecording}
              onPress={resetRecording}>
              <ButtonIcon as={RotateCcw} />
              <ButtonText>重置</ButtonText>
            </Button>
            <Button
              isDisabled={!recordingStatus || recordingStatus?.isRecording}
              onPress={commitRecording}
              variant="link"
              action="primary">
              <ButtonIcon as={Check} />
              <ButtonText>确定</ButtonText>
            </Button>
          </HStack>
        </BottomSheetFooter>
      );
    },
    [commitRecording, insets.bottom, pauseRecording, recordingStatus, resetRecording],
  );

  const onDismiss = useCallback(() => {
    resetRecording();
  }, [resetRecording]);

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      enablePanDownToClose={true}
      backdropComponent={renderBackdrop}
      footerComponent={renderFooter}
      onDismiss={onDismiss}>
      <VStack
        className="flex-1 bg-background-100 p-2"
        space="md"
        style={{ paddingBottom: insets.bottom + 60 }}>
        <VStack className="items-center">
          <Heading className="p-2">录音</Heading>
          <Divider />
        </VStack>
        <VStack className="flex-1 items-center justify-center" space="4xl">
          <Text size="4xl" bold={true}>
            {formattedTime}
          </Text>
          <AnimatedRing
            metering={metering}
            recordingStatus={recordingStatus}
            doRecording={doRecording}
          />
        </VStack>
      </VStack>
    </BottomSheetModal>
  );
});
