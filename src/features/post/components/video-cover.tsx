import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';

export const VideoCover: React.FC<any> = ({ item, onPress, width = '100%', height = '100%' }) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <View className="flex-1 items-center justify-center">
        <Image
          source={{
            uri: item.thumbnail,
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
    </TouchableOpacity>
  );
};
