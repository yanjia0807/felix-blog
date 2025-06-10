import React from 'react';
import { FlatList } from 'react-native';
import { ImageItem } from './image-item';

export const ImageList = ({ value = [], onPress }: any) => {
  const renderItem = ({ item, index }: any) => (
    <ImageItem
      item={item}
      onPress={() => onPress(index)}
      className={`mx-1 h-16 w-16 ${index === 0 ? 'ml-0' : ''} ${index === value.length - 1 ? 'mr-0' : ''}`}
    />
  );

  return (
    <FlatList
      data={value}
      horizontal={true}
      renderItem={renderItem}
      showsHorizontalScrollIndicator={false}
    />
  );
};
