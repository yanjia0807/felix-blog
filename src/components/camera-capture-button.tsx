import React, { memo, useRef } from 'react';
import { View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Reanimated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const CameraCaptureButton: React.FC<any> = memo(function CameraCaptureButton({
  camera,
  onCaptured,
  flash,
  enabled,
  setIsRecording,
  setRecordingTime,
  maxDuration,
  ...props
}): React.ReactElement {
  const timerRef = useRef<any>(null);
  const isPressingButton = useSharedValue(false);
  const insets = useSafeAreaInsets();

  const takePhoto = async () => {
    try {
      if (camera.current == null) throw new Error('Camera ref is null!');

      const photo = await camera.current.takePhoto({
        flash: flash,
        enableShutterSound: false,
      });

      onCaptured(photo, 'photo');
    } catch (e) {
      console.error('Failed to take photo!', e);
    }
  };

  const onStartedRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);

    timerRef.current = setInterval(() => {
      setRecordingTime((prev) => {
        if (prev + 1 >= maxDuration) {
          stopRecording();
          return maxDuration;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const onStoppedRecording = () => {
    setIsRecording(false);
    setRecordingTime(0);
    clearInterval(timerRef.current);
  };

  const startRecording = () => {
    try {
      if (camera.current == null) throw new Error('Camera ref is null!');
      onStartedRecording();

      camera.current.startRecording({
        flash: flash,
        onRecordingError: (error) => {
          console.error('Recording failed!', error);
          onStoppedRecording();
        },
        onRecordingFinished: (video) => {
          onCaptured(video, 'video');
          onStoppedRecording();
        },
      });
    } catch (e) {
      console.error('failed to start recording!', e, 'camera');
    }
  };

  const stopRecording = async () => {
    try {
      if (camera.current == null) throw new Error('Camera ref is null!');
      await camera.current.stopRecording();
    } catch (e) {
      console.error('failed to stop recording!', e);
    }
  };

  const singleTap = Gesture.Tap()
    .onStart(() => {
      isPressingButton.value = true;
    })
    .onEnd((e) => {
      isPressingButton.value = false;
      runOnJS(takePhoto)();
    });

  const longPress = Gesture.LongPress()
    .onStart(() => {
      isPressingButton.value = true;
      runOnJS(startRecording)();
    })
    .onEnd((e) => {
      isPressingButton.value = false;
      runOnJS(stopRecording)();
    });

  const taps = Gesture.Exclusive(longPress, singleTap);

  const shadowStyle = useAnimatedStyle(
    () => ({
      transform: [
        {
          scale: withSpring(isPressingButton.value ? 1 : 0, {
            mass: 1,
            damping: 35,
            stiffness: 300,
          }),
        },
      ],
    }),
    [isPressingButton],
  );

  const buttonAnimatedStyle = useAnimatedStyle(() => {
    let scale: number;
    if (enabled) {
      if (isPressingButton.value) {
        scale = withRepeat(
          withSpring(1, {
            stiffness: 100,
            damping: 1000,
          }),
          -1,
          true,
        );
      } else {
        scale = withSpring(0.9, {
          stiffness: 500,
          damping: 300,
        });
      }
    } else {
      scale = withSpring(0.6, {
        stiffness: 500,
        damping: 300,
      });
    }

    return {
      opacity: withTiming(enabled ? 1 : 0.3, {
        duration: 100,
        easing: Easing.linear,
      }),
      transform: [
        {
          scale: scale,
        },
      ],
    };
  }, [enabled, isPressingButton]);

  return (
    <GestureDetector gesture={taps}>
      <Reanimated.View
        {...props}
        className="absolute self-center"
        style={[
          {
            position: 'absolute',
            alignSelf: 'center',
            bottom: insets.bottom + 10,
          },
          buttonAnimatedStyle,
        ]}>
        <Reanimated.View className="flex-1">
          <Reanimated.View
            className="absolute h-[68] w-[68] rounded-full border-primary-200 bg-primary-400"
            style={shadowStyle}
          />
          <View className="h-[68] w-[68] rounded-full border-4 border-primary-500" />
        </Reanimated.View>
      </Reanimated.View>
    </GestureDetector>
  );
});
