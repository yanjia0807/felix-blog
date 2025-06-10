import { Image } from 'expo-image';
import React from 'react';
import { TouchableOpacity } from 'react-native';

export const ImageCover: React.FC<any> = ({
  item,
  onPress = () => {},
  width = '100%',
  height = '100%',
}) => {
  return (
    <TouchableOpacity onPress={onPress}>
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
    </TouchableOpacity>
  );
};
