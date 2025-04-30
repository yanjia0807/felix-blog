import React, { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BottomSheetBackdrop, BottomSheetFooter, BottomSheetModal } from '@gorhom/bottom-sheet';
import { intervalToDuration } from 'date-fns';
import { Audio, AVPlaybackStatus } from 'expo-av';
import { Recording, RecordingStatus } from 'expo-av/build/Audio';
import Constants from 'expo-constants';
import _ from 'lodash';
import { Check, CircleX, Mic, MicOff, PauseCircle, RotateCcw, Volume2 } from 'lucide-react-native';
import { Keyboard, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  withSpring,
  BounceIn,
  BounceOut,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { twMerge } from 'tailwind-merge';
import { Button, ButtonIcon, ButtonSpinner, ButtonText } from './ui/button';
import { Divider } from './ui/divider';
import { Heading } from './ui/heading';
import { HStack } from './ui/hstack';
import { Text } from './ui/text';
import { VStack } from './ui/vstack';
import useCustomToast from '../hooks/use-custom-toast';

const SELECTION_LIMIT = 5;
const appName = Constants?.expoConfig?.extra?.name || '';

const AnimatedRing = ({ metering, recordingStatus, doRecording }: any) => {
  const ringStyle = useAnimatedStyle(() => ({
    opacity: withSpring(interpolate(metering.value, [-160, 0], [0, 1])),
    transform: [
      {
        scale: withSpring(interpolate(metering.value, [-160, 0], [0.5, 1])),
      },
    ],
  }));

  return (
    <TouchableOpacity onPress={doRecording}>
      <Animated.View entering={BounceIn} exiting={BounceOut}>
        <Animated.View
          className="h-40 w-40 items-center justify-center rounded-full bg-primary-400"
          style={[{ opacity: 0.7 }, ringStyle]}>
          {recordingStatus?.isRecording ? (
            <Mic size={48} color="white" />
          ) : (
            <MicOff size={48} color="white" />
          )}
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
};

export const RecordingInput = ({ onChange, value }: any) => {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const toast = useCustomToast();
  const [audioPermission, requestAudioPermission] = Audio.usePermissions();
  const onInputIconPressed = async () => {
    if (audioPermission?.granted) {
      bottomSheetRef.current?.present();
      Keyboard.dismiss();
    } else {
      const result = await requestAudioPermission();
      if (result.granted) {
        bottomSheetRef.current?.present();
        Keyboard.dismiss();
      } else {
        if (!result.canAskAgain) {
          toast.info({
            description: `请在 [系统设置] 里允许 ${appName} 访问您的麦克风。`,
          });
        }
      }
    }
  };

  return (
    <>
      <Button variant="link" action="secondary" onPress={() => onInputIconPressed()}>
        <ButtonIcon as={Mic} />
        <ButtonText>录音</ButtonText>
      </Button>
      <RecordingSheet onChange={onChange} value={value} ref={bottomSheetRef} />
    </>
  );
};

export const RecordingSheet = forwardRef(function Sheet({ onChange, value }: any, ref: any) {
  const [recording, setRecording] = useState<Recording | null>();
  const [recordingStatus, setRecordingStatus] = useState<any>();
  const metering = useSharedValue<number>(0);
  const [durationMillis, setDurationMillis] = useState<number>(0);
  const snapPoints = useMemo(() => ['50%'], []);
  const insets = useSafeAreaInsets();
  const toast = useCustomToast();
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
        className="flex-1 bg-background-100 p-4"
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

export const RecordingList = ({ value = [], onChange, className = '', readonly = false }: any) => {
  const onRemove = async (uri: string) => {
    onChange(_.filter(value, (item: any) => item.uri !== uri));
  };

  if (value.length > 0) {
    return (
      <HStack space="sm" className={twMerge('flex-wrap', className)}>
        {value.map((item: any) => (
          <RecordingIcon key={item.uri} item={item} onRemove={onRemove} readonly={readonly} />
        ))}
      </HStack>
    );
  }
};

export const RecordingIcon = ({ item, onRemove, className, readonly }: any) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [durationMillis, setDurationMillis] = useState(0);
  const recordingRef = useRef<any>({ sound: null, isPlaying: false });

  const duration: any = intervalToDuration({ start: 0, end: durationMillis });
  const formattedTime = `${String(duration?.minutes || '').padStart(2, '0')}:${String(duration?.seconds || '').padStart(2, '0')}`;

  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      recordingRef.current.isPlaying = status.isPlaying;
      setIsPlaying(status.isPlaying);
    }
  };

  const onItemPress = async () => {
    if (!recordingRef.current.isPlaying) {
      await recordingRef.current.sound.setPositionAsync(0);
      await recordingRef.current.sound.playAsync();
    } else {
      await recordingRef.current.sound.stopAsync();
    }
  };

  useEffect(() => {
    const loadAudio = async () => {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
      });
      const { sound, status }: any = await Audio.Sound.createAsync(
        { uri: item.uri },
        { shouldPlay: false },
        onPlaybackStatusUpdate,
      );
      setDurationMillis(status.durationMillis);
      recordingRef.current.sound = sound;
    };
    loadAudio();

    return recordingRef.current.sound
      ? () => {
          recordingRef.current.sound.unloadAsync();
        }
      : undefined;
  }, [item.uri]);

  return (
    <Button
      onPress={() => onItemPress()}
      className={twMerge(
        className,
        'items-center justify-start rounded opacity-50',
        !readonly ? 'pr-8' : undefined,
      )}>
      <ButtonIcon as={Volume2} />
      <ButtonText>{formattedTime}</ButtonText>
      <ButtonSpinner style={isPlaying ? { display: 'flex' } : { display: 'none' }} />
      {!readonly && (
        <Button
          size="xs"
          className="absolute right-0 top-0 h-auto p-1"
          onPress={() => onRemove(item.uri)}>
          <ButtonIcon as={CircleX} />
        </Button>
      )}
    </Button>
  );
};
