import { Portal } from '@/components/ui/portal';
import _ from 'lodash';
import React, { useEffect, useRef } from 'react';
import { View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const MeteringBar: React.FC<any> = ({ value }) => {
  const metering = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scaleY: withSpring(
            interpolate(metering.value, [-60, -10], [0.2, 2], Extrapolation.CLAMP),
            { damping: 12 },
          ),
        },
      ],
      opacity: interpolate(metering.value, [-60, -10], [0.4, 1], Extrapolation.CLAMP),
    };
  });

  useEffect(() => {
    const jitter = Math.random() * 2 - 1;
    metering.value = value + jitter;
  }, [metering, value]);

  return <Animated.View className="mx-[0.5] h-2 w-[2] bg-typography-0" style={[animatedStyle]} />;
};

export const VoiceBar: React.FC<any> = ({ data }) => {
  const meterings = useRef(_.fill(new Array(32), -160));

  useEffect(() => {
    if (data) {
      meterings.current.unshift(data.metering);
      meterings.current.pop();
    }
  }, [data]);

  return (
    <Portal style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} isOpen={true}>
      <View className="h-10 flex-row items-center justify-center overflow-hidden rounded-lg border-secondary-300 bg-secondary-500 px-2 py-4">
        {meterings.current.map((value, index) => (
          <MeteringBar key={index} value={value} />
        ))}
      </View>
    </Portal>
  );
};
