import { Mic, MicOff } from 'lucide-react-native';
import React from 'react';
import { TouchableOpacity } from 'react-native';
import Animated, {
  BounceIn,
  BounceOut,
  interpolate,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

export const AnimatedRing = ({ metering, recordingStatus, doRecording }: any) => {
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
