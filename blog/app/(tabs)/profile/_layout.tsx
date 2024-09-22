import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { Stack, useNavigation } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const BackButton = () => {
  const { goBack } = useNavigation();

  return (
    <TouchableOpacity
      style={{
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
      }}
      onPress={goBack}
    >
      <Ionicons name="chevron-back" size={24} color="black" />
    </TouchableOpacity>
  );
};

const _layout = () => {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
};

export default _layout;
