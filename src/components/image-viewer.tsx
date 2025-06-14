import { ZOOM_TYPE, Zoomable } from '@likashefqet/react-native-image-zoom';
import React, { useState } from 'react';
import { View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { ImageryItem } from './imagery-item';

const ImageViewer: React.FC<any> = ({ item, onClose }) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const offsetY = useSharedValue(0);
  const opacity = useSharedValue(1);

  const imageStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: offsetY.value }],
    opacity: opacity.value,
  }));

  const onZoom = (zoomType?: ZOOM_TYPE) => {
    if (!zoomType || zoomType === ZOOM_TYPE.ZOOM_IN) {
      setIsZoomed(true);
    }
  };

  const onAnimationEnd = (finished?: boolean) => {
    if (finished) {
      setIsZoomed(false);
    }
  };

  const pan = Gesture.Pan()
    .enabled(!isZoomed)
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
          <Zoomable
            style={{ flex: 1 }}
            isSingleTapEnabled
            isDoubleTapEnabled
            onInteractionStart={() => onZoom()}
            onDoubleTap={(zoomType) => onZoom(zoomType)}
            onResetAnimationEnd={(finished, values) => onAnimationEnd(finished)}>
            <ImageryItem
              style={{
                width: '100%',
                height: '100%',
              }}
              source={{ uri: item.preview }}
              cacheKey={item.name}
              assetId={item.assetId}
              mime={item.mime}
              alt={item.alternativeText || item.name}
              resizeMode="contain"
            />
          </Zoomable>
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

export default ImageViewer;
