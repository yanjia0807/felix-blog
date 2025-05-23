import React from 'react';
import { Image } from 'expo-image';

export const ImageCover: React.FC<any> = ({ item, width = '100%', height = '100%' }) => {
  return (
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
  );
};
