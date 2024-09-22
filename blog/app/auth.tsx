import { View, useWindowDimensions } from "react-native";
import React, { useState } from "react";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { RegisterView } from "~/components/register-view";
import { LoginView } from "~/components/login-view";
import { router, useLocalSearchParams } from "expo-router";

const authScreen = () => {
  const translateX = useSharedValue(0);
  const { displayView } = useLocalSearchParams();
  const [currentView, setCurrentView] = useState(displayView);

  const updateView = (nextView: any) => {
    setCurrentView(nextView);
  };

  const { width: windowWidth } = useWindowDimensions();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const animateViewTransition = (nextView: any) => {
    const direction = nextView === "register" ? windowWidth : -windowWidth;

    translateX.value = withTiming(direction, { duration: 300 }, () => {
      runOnJS(updateView)(nextView);
      translateX.value = withTiming(
        nextView === "register" ? -windowWidth : windowWidth,
        {
          duration: 0,
        }
      );
      translateX.value = withTiming(0, { duration: 300 });
    });
  };

  return (
    <View className="flex-1">
      <Animated.View style={[{ flex: 1 }, animatedStyle]}>
        {currentView === "register" ? (
          <RegisterView
            className="flex-1"
            animateViewTransition={animateViewTransition}
          />
        ) : (
          <LoginView
            className="flex-1"
            animateViewTransition={animateViewTransition}
          />
        )}
      </Animated.View>
    </View>
  );
};

export default authScreen;
