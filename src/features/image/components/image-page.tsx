import React, { useRef, useState } from 'react';
import { Image } from 'expo-image';
import { X } from 'lucide-react-native';
import { View, useWindowDimensions, TouchableOpacity, Pressable } from 'react-native';
import Animated, { Easing, Keyframe } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Zoom from 'react-native-zoom-reanimated';
import PageSpinner from '@/components/page-spinner';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { usePagerView } from './pager-view-provider';

export const ImagePage: React.FC<any> = ({ item, pageNum, isVisible, toggleVisible }) => {
  const [isLoading, setIsLoading] = useState(false);

  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const { pages, onClose } = usePagerView();
  const timeoutRef = useRef<any>(null);

  const handlePress = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      return;
    }

    timeoutRef.current = setTimeout(() => {
      toggleVisible();
      timeoutRef.current = null;
    }, 300);
  };

  const onLoadStart = () => setIsLoading(true);

  const onLoad = () => setIsLoading(false);

  const enteringAnimation = new Keyframe({
    0: {
      opacity: 0,
    },
    100: {
      opacity: 0.5,
      easing: Easing.in(Easing.linear),
    },
  }).duration(100);

  const exitingAnimation = new Keyframe({
    0: {
      opacity: 0.5,
    },
    100: {
      opacity: 0,
      easing: Easing.out(Easing.linear),
    },
  }).duration(100);

  return (
    <View className="flex-1">
      <Pressable onPress={() => handlePress()} className="flex-1">
        {isLoading && <PageSpinner />}
        <Zoom>
          <Image
            source={item.preview}
            contentFit="contain"
            style={{ width: screenWidth, flex: 1 }}
            onLoadStart={onLoadStart}
            onLoadEnd={onLoad}
          />
        </Zoom>
      </Pressable>
      {isVisible && (
        <Animated.View
          entering={enteringAnimation}
          exiting={exitingAnimation}
          className="absolute top-0 w-full bg-background-100 px-4 py-2"
          style={{
            paddingTop: insets.top,
          }}>
          <HStack className="h-11 items-center justify-between">
            <View className="h-[35] w-[24]" />
            <Heading size="lg" bold={true}>{`${pageNum}/${pages.length}`}</Heading>
            <TouchableOpacity onPress={onClose}>
              <Icon as={X} size={24 as any} />
            </TouchableOpacity>
          </HStack>
        </Animated.View>
      )}
    </View>
  );
};
