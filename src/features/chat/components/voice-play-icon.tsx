import { Icon } from '@/components/ui/icon';
import { AudioLines } from 'lucide-react-native';
import React, { useEffect } from 'react';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
} from 'react-native-reanimated';

const AnimatedIcon = Animated.createAnimatedComponent(Icon);

export const VoicePlayIcon: React.FC<any> = ({ isPlaying }) => {
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  useEffect(() => {
    if (isPlaying) {
      opacity.value = withRepeat(withSpring(0.3), -1, true);
    } else {
      opacity.value = 1;
      cancelAnimation(opacity);
    }
  }, [isPlaying, opacity]);

  return <AnimatedIcon as={AudioLines} style={animatedStyle} />;
};
