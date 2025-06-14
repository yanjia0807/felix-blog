import { Portal } from '@/components/ui/portal';
import React from 'react';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

export const VoiceTiming: React.FC<any> = ({ remainingTime }) => {
  return (
    <Portal style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} isOpen={true}>
      <Animated.View
        entering={FadeIn}
        exiting={FadeOut}
        className="z-10 h-12 w-12 items-center justify-center rounded-full border border-secondary-300 bg-background-50 opacity-75">
        <Animated.Text className="text-lg font-bold text-primary-600">
          {remainingTime}
        </Animated.Text>
      </Animated.View>
    </Portal>
  );
};
