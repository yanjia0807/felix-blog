import { FormControl } from '@/components/ui/form-control';
import React, { memo, useEffect } from 'react';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useRecordVoice } from '../hooks/use-record-voice';
import { VoiceBar } from './voice-bar';
import { VoiceTiming } from './voice-timing';

export const MessageVoiceInput: React.FC<any> = memo(function MessageInput({ onChange, onSubmit }) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const textStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const startCb = () => {
    scale.value = withTiming(1.2);
    opacity.value = 0.75;
  };

  const stopCb = () => {
    scale.value = withTiming(1);
    opacity.value = 1;
  };

  const successCb = ({ file, secs }) => {
    onChange({ file, secs });
    onSubmit();
  };

  const { onStartRecord, onStopRecord, isRecording, recordingStatus } = useRecordVoice({
    startCb,
    stopCb,
    successCb,
  });

  const longPressGesture = Gesture.LongPress()
    .runOnJS(true)
    .maxDistance(50)
    .onStart((e) => onStartRecord())
    .onEnd((e, success) => onStopRecord(success));

  useEffect(() => {
    if (isRecording && recordingStatus?.remainingTime <= 0) {
      onStopRecord(true);
    }
  }, [isRecording, recordingStatus, onStopRecord]);

  return (
    <>
      <FormControl size="lg" className="flex-1">
        <GestureDetector gesture={longPressGesture}>
          <Animated.View
            style={buttonStyle}
            className="group/button h-11 flex-row items-center justify-center gap-2 rounded-full border-primary-300 bg-primary-500 px-6 data-[focus-visible=true]:web:outline-none data-[focus-visible=true]:web:ring-2 data-[focus-visible=true]:web:ring-indicator-info data-[hover=true]:border-primary-400 data-[hover=true]:bg-primary-600 data-[active=true]:border-primary-500 data-[active=true]:bg-primary-700 data-[disabled=true]:opacity-40">
            <Animated.Text
              style={textStyle}
              className="text-lg font-semibold text-typography-0 web:select-none data-[hover=true]:text-primary-600 data-[active=true]:text-primary-700">
              按住说话
            </Animated.Text>
          </Animated.View>
        </GestureDetector>
      </FormControl>
      {isRecording && recordingStatus && recordingStatus.remainingTime <= 10 && (
        <VoiceTiming remainingTime={recordingStatus.remainingTime} />
      )}
      {isRecording && <VoiceBar data={recordingStatus} />}
    </>
  );
});
