import React, { useRef, useState } from 'react';
import { View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { ResizeMode } from 'react-native-video';
import VideoPlayer, { type VideoPlayerRef } from 'react-native-video-player';

const VideoViewer: React.FC<any> = ({ item, onClose }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const playerRef = useRef<VideoPlayerRef>(null);
  const offsetY = useSharedValue(0);
  const opacity = useSharedValue(1);

  const imageStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: offsetY.value }],
    opacity: opacity.value,
  }));

  const pan = Gesture.Pan()
    .enabled(!isFullscreen)
    .activeOffsetY([-5, 5])
    .onUpdate((e) => {
      if (Math.abs(e.translationX) < Math.abs(e.translationY)) {
        offsetY.value = e.translationY;
        opacity.value = 1 - Math.min(1, Math.abs(e.translationY) / 300);
      }
    })
    .onEnd((e) => {
      if (Math.abs(e.translationY) > 100 || Math.abs(e.velocityY) > 800) {
        runOnJS(onClose)();
      } else {
        offsetY.value = withSpring(0, { damping: 15, stiffness: 120 });
        opacity.value = withSpring(1, { damping: 15, stiffness: 120 });
      }
    });

  return (
    <View className="flex-1">
      <GestureDetector gesture={pan}>
        <Animated.View style={[{ flex: 1 }, imageStyle]}>
          <VideoPlayer
            ref={playerRef}
            source={{
              uri: item.preview,
            }}
            thumbnail={{ uri: item.thumbnail }}
            onError={(e) => console.error(e)}
            onFullscreenPlayerDidPresent={() => setIsFullscreen(true)}
            onFullscreenPlayerDidDismiss={() => setIsFullscreen(false)}
            showDuration={true}
            hideControlsOnStart={true}
            resizeMode={ResizeMode.COVER}
            style={{
              width: '100%',
              height: '100%',
            }}
          />
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

export default VideoViewer;
