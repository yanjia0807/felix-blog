import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useEvent, useEventListener } from 'expo';
import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import _ from 'lodash';
import { Volume2, VolumeX, X } from 'lucide-react-native';
import {
  View,
  useWindowDimensions,
  TouchableOpacity,
  Pressable,
  useColorScheme,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import PagerView from 'react-native-pager-view';
import Animated, { Easing, FadeIn, FadeOut, Keyframe } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Zoom from 'react-native-zoom-reanimated';
import { FileTypeNum } from '@/utils/file';
import PageSpinner from './page-spinner';
import { Heading } from './ui/heading';
import { HStack } from './ui/hstack';
import { Icon } from './ui/icon';
import { Portal } from './ui/portal';
import { Text } from './ui/text';

const ImagePage: React.FC<any> = ({ item, onClose, index, total, isVisible, toggleVisible }) => {
  const [isLoading, setIsLoading] = useState(false);

  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();

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
        <PageSpinner isVisiable={isLoading} />
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
            <Heading size="lg" bold={true}>{`${index + 1}/${total}`}</Heading>
            <TouchableOpacity onPress={onClose}>
              <Icon as={X} size={24 as any} />
            </TouchableOpacity>
          </HStack>
        </Animated.View>
      )}
    </View>
  );
};

const VideoPage: React.FC<any> = ({
  item,
  onClose,
  index,
  currentIndex,
  total,
  isVisible,
  toggleVisible,
}: any) => {
  const [playToEnd, setPlayToEnd] = useState(false);
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

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
    if (index !== currentIndex) {
      if (isPlaying) {
        player.pause();
      }
    }
  }, [currentIndex, index, isPlaying, player]);

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
              <Heading size="lg" bold={true}>{`${index + 1}/${total}`}</Heading>
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

const PageContent: React.FC<any> = ({
  item,
  index,
  currentIndex,
  total,
  isVisible,
  toggleVisible,
  onClose,
}) => {
  return (
    <View className="w-full flex-1">
      {item.fileType === FileTypeNum.Image ? (
        <ImagePage
          item={item}
          index={index}
          currentIndex={currentIndex}
          total={total}
          isVisible={isVisible}
          toggleVisible={toggleVisible}
          onClose={onClose}
        />
      ) : (
        <VideoPage
          item={item}
          index={index}
          currentIndex={currentIndex}
          isVisible={isVisible}
          toggleVisible={toggleVisible}
          total={total}
          onClose={onClose}
        />
      )}
    </View>
  );
};

const AlbumPagerView: React.FC<any> = ({ isOpen, onClose, value, initIndex = 0 }: any) => {
  const [isVisible, setIsVisible] = useState(false);
  const [loadedPages, setLoadedPages] = useState<Set<number>>(new Set([initIndex]));
  const [currentIndex, setCurrentIndex] = useState(initIndex);

  const onPageSelected = (e: any) => {
    const position = e.nativeEvent.position;
    const loaded = new Set(loadedPages);
    [position - 1, position, position + 1].forEach((index) => {
      if (index >= 0 && index < value.length) {
        loaded.add(index);
      }
    });

    setCurrentIndex(position);
    setLoadedPages(loaded);
  };

  const onPageScroll = (e: any) => {
    if (e.nativeEvent.position < 0 || e.nativeEvent.position === value.length) {
      onClose();
    }
  };

  const toggleVisible = () => setIsVisible((val) => !val);

  return (
    <Portal isOpen={isOpen} style={{ flex: 1 }} useRNModal={true}>
      <Animated.View
        entering={FadeIn.duration(100)}
        exiting={FadeOut.duration(100)}
        className="flex-1 bg-background-50">
        <PagerView
          style={{ flex: 1 }}
          initialPage={initIndex}
          overdrag={true}
          overScrollMode="always"
          pageMargin={20}
          onPageSelected={onPageSelected}
          onPageScroll={onPageScroll}>
          {value.map((item: any, index: number) => {
            return (
              <View className="flex-1" key={index}>
                {loadedPages.has(index) ? (
                  <PageContent
                    item={item}
                    index={index}
                    currentIndex={currentIndex}
                    total={value.length}
                    isVisible={isVisible}
                    toggleVisible={toggleVisible}
                    onClose={onClose}
                  />
                ) : (
                  <></>
                )}
              </View>
            );
          })}
        </PagerView>
      </Animated.View>
    </Portal>
  );
};

export default AlbumPagerView;
