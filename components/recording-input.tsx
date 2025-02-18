import { BottomSheetBackdrop, BottomSheetFooter, BottomSheetModal } from '@gorhom/bottom-sheet';
import { intervalToDuration } from 'date-fns';
import { Audio, AVPlaybackStatus } from 'expo-av';
import { Recording, RecordingStatus } from 'expo-av/build/Audio';
import { Check, Mic, MicOff, PauseCircle, RotateCcw, Trash2, Volume2 } from 'lucide-react-native';
import React, { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { twMerge } from 'tailwind-merge';
import { apiServerURL } from '@/api';
import { Button, ButtonIcon, ButtonSpinner, ButtonText } from './ui/button';
import { Divider } from './ui/divider';
import { Heading } from './ui/heading';
import { HStack } from './ui/hstack';
import { Text } from './ui/text';
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

export const RecordingInput = ({ onChange, value }: any) => {
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
      <RecordingSheet onChange={onChange} value={value} ref={bottomSheetRef} />
    </>
  );
};

export const RecordingSheet = forwardRef(function Sheet({ onChange, value }: any, ref: any) {
  const [recording, setRecording] = useState<Recording | null>();
  const [recordingStatus, setRecordingStatus] = useState<any>();
  const [audioPermission, requestAudioPermission] = Audio.usePermissions();
  const metering = useSharedValue<number>(0);
  const [durationMillis, setDurationMillis] = useState<number>(0);
  const snapPoints = useMemo(() => ['50%'], []);
  const insets = useSafeAreaInsets();

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
    onChange([...value, recording]);
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
      <BottomSheetFooter {...props}>
        <HStack
          className="items-center justify-around bg-background-50 p-2"
          style={{ paddingBottom: insets.bottom }}>
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
      <VStack
        className="flex-1 bg-background-100 p-4"
        space="md"
        style={{ paddingBottom: insets.bottom + 60 }}>
        <VStack className="items-center">
          <Heading className="p-2">录音</Heading>
          <Divider />
        </VStack>
        <VStack className="flex-1 items-center justify-center">
          <Text size="5xl" bold={true}>
            {formattedTime}
          </Text>
        </VStack>
      </VStack>
    </BottomSheetModal>
  );
});

export const RecordingList = ({ recordings, onRemove, className = '' }: any) => {
  if (recordings.length > 0) {
    return (
      <HStack space="sm" className={twMerge('flex-wrap', className)}>
        {recordings.map((item: any) => (
          <RecordingIcon key={item._uri || item.url} item={item} onRemove={onRemove} />
        ))}
      </HStack>
    );
  }
};

export const RecordingIcon = ({ item, onRemove, className }: any) => {
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

  const onRemoveBtnPress = async () => {
    const key = item._uri || item.url;
    onRemove(key);
  };

  useEffect(() => {
    const loadAudio = async () => {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
      });
      let source = item._uri ? { uri: item._uri } : { uri: `${apiServerURL}${item.url}` };
      const { sound, status }: any = await Audio.Sound.createAsync(
        source,
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
  }, [item._uri, item.url]);

  return (
    <Button
      onPress={() => onItemPress()}
      className={twMerge(className, 'my-2 items-center justify-start rounded')}>
      <ButtonIcon as={Volume2} />
      <ButtonText>{formattedTime}</ButtonText>
      <ButtonSpinner style={isPlaying ? { display: 'flex' } : { display: 'none' }} />
      {onRemove && (
        <Button size="xs" action="negative" className="p-1" onPress={() => onRemoveBtnPress()}>
          <ButtonIcon as={Trash2} />
        </Button>
      )}
    </Button>
  );
};
