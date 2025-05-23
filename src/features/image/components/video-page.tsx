import React, { useCallback, useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useEvent, useEventListener } from 'expo';
import { useVideoPlayer, VideoView } from 'expo-video';
import _ from 'lodash';
import { Volume2, VolumeX, X } from 'lucide-react-native';
import { View, useWindowDimensions, TouchableOpacity, useColorScheme } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { Easing, Keyframe } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PageSpinner from '@/components/page-spinner';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { usePagerView } from './pager-view-provider';

export const VideoPage: React.FC<any> = ({ item, pageNum, isVisible, toggleVisible }: any) => {
  const [playToEnd, setPlayToEnd] = useState(false);
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const { pageIndex, pages, onClose } = usePagerView();

  const colorSchema = useColorScheme() || 'light';
  const maximumTrackTintColor = colorSchema === 'light' ? 'rgb(230 230 231)' : 'rgb(165 164 164)';
  const minimumTrackTintColor = colorSchema === 'light' ? 'rgb(56 57 57)' : 'rgb(150 150 150)';

  const formatTime = (totalSeconds: number) => {
    const minutes = _.floor(totalSeconds / 60);
    const seconds = _.floor(totalSeconds % 60);
    return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const tap = Gesture.Tap()
    .onStart(() => toggleVisible())
    .runOnJS(true);

  const doubleTap = Gesture.Tap().numberOfTaps(2);

  const player = useVideoPlayer(item.preview, (player) => {
    player.timeUpdateEventInterval = 1;
  });

  const { status } = useEvent(player, 'statusChange', { status: player.status });
  const isLoading = status === 'loading';

  useEventListener(player, 'playToEnd', () => {
    setPlayToEnd(true);
  });

  const timeUpdateEvent = useEvent(player, 'timeUpdate', {
    currentTime: player.currentTime,
    currentLiveTimestamp: player.currentLiveTimestamp,
    currentOffsetFromLive: player.currentOffsetFromLive,
    bufferedPosition: player.bufferedPosition,
  });

  const { muted } = useEvent(player, 'mutedChange', {
    muted: player.muted,
  });

  const { isPlaying } = useEvent(player, 'playingChange', {
    isPlaying: player.playing,
  });

  const duration = player.duration;
  const currentTime = timeUpdateEvent.currentTime;

  const togglePlay = useCallback(() => {
    if (isPlaying && !playToEnd) {
      player.pause();
    } else {
      if (playToEnd) {
        setPlayToEnd(false);
        player.replay();
      }
      player.play();
    }
  }, [isPlaying, playToEnd, player]);

  const toggleMute = useCallback(() => {
    player.muted = !muted;
  }, [muted, player]);

  const onSliderValueChange = useCallback(
    (value: number) => {
      player.currentTime = value;
    },
    [player],
  );

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

  useEffect(() => {
    if (pageIndex !== pageNum - 1) {
      if (isPlaying) {
        player.pause();
      }
    }
  }, [pageNum, pageIndex, isPlaying, player]);

  return (
    <View className="flex-1">
      <PageSpinner isVisiable={isLoading} />
      <GestureDetector gesture={Gesture.Exclusive(doubleTap, tap)}>
        <VideoView
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
          allowsFullscreen={false}
          nativeControls={false}
          allowsPictureInPicture={false}
          player={player}
        />
      </GestureDetector>
      {isVisible && (
        <>
          <Animated.View
            entering={enteringAnimation}
            exiting={exitingAnimation}
            className="absolute top-0 w-full bg-background-100 px-4 py-2"
            style={{
              paddingTop: insets.top,
            }}>
            <HStack className="h-11 items-center justify-between">
              <TouchableOpacity onPress={toggleMute}>
                <Icon as={player.muted ? VolumeX : Volume2} size={24 as any} />
              </TouchableOpacity>
              <Heading size="lg" bold={true}>{`${pageNum}/${pages.length}`}</Heading>
              <TouchableOpacity onPress={onClose}>
                <Icon as={X} size={24 as any} />
              </TouchableOpacity>
            </HStack>
          </Animated.View>
          <Animated.View
            entering={enteringAnimation}
            exiting={exitingAnimation}
            className="absolute"
            style={{
              left: screenWidth / 2 - 40,
              top: screenHeight / 2 - 40,
            }}>
            <TouchableOpacity onPress={togglePlay}>
              <Ionicons
                name={isPlaying ? 'pause-circle-outline' : 'play-circle-outline'}
                size={80}
                color="white"
              />
            </TouchableOpacity>
          </Animated.View>
          <Animated.View
            entering={enteringAnimation}
            exiting={exitingAnimation}
            className="absolute bottom-0 w-full bg-background-100 p-4"
            style={{
              paddingBottom: insets.bottom,
            }}>
            <HStack className="w-full items-center justify-center" space="md">
              <Text className="text-xs text-white">{formatTime(currentTime)}</Text>
              <Slider
                style={{ flex: 1 }}
                maximumValue={duration}
                value={currentTime}
                onValueChange={onSliderValueChange}
                maximumTrackTintColor={maximumTrackTintColor}
                minimumTrackTintColor={minimumTrackTintColor}
              />
              <Text className="text-xs text-white">{formatTime(duration)}</Text>
            </HStack>
          </Animated.View>
        </>
      )}
    </View>
  );
};
