import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { View } from 'react-native';

export const VideoCover: React.FC<any> = ({ item, width = '100%', height = '100%' }) => {
  return (
    <View className="flex-1 items-center justify-center">
      <Image
        source={{
          uri: item.cover.thumbnail,
        }}
        contentFit="cover"
        style={{
          width,
          height,
          borderRadius: 6,
        }}
      />
      <View className="absolute">
        <Ionicons name="play-circle-outline" size={42} className="opacity-50" color="white" />
      </View>
    </View>
  );
};
