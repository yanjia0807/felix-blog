import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import _ from 'lodash';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';

export const ImageryCover: React.FC<any> = ({
  uri,
  mime,
  name,
  alternativeText,
  width = '100%',
  height = '100%',
  onPress = () => {},
}) => {
  return (
    <>
      {_.startsWith(mime, 'image') && (
        <TouchableOpacity onPress={onPress}>
          <Image
            source={{ uri }}
            contentFit="cover"
            cachePolicy="disk"
            style={{
              width,
              height,
              borderRadius: 6,
            }}
            alt={alternativeText || name}
          />
        </TouchableOpacity>
      )}
      {_.startsWith(mime, 'video') && (
        <TouchableOpacity onPress={onPress}>
          <View className="flex-1 items-center justify-center">
            <Image
              source={{ uri }}
              contentFit="cover"
              cachePolicy="disk"
              style={{
                width,
                height,
                borderRadius: 6,
              }}
              alt={alternativeText || name}
            />
            <View className="absolute">
              <Ionicons name="play-circle-outline" size={42} className="opacity-50" color="white" />
            </View>
          </View>
        </TouchableOpacity>
      )}
    </>
  );
};
