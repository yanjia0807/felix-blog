import React, { memo, useCallback } from 'react';
import { FlatList } from 'react-native';
import { ImageryItem } from './imagery-item';

export const ImageryList = memo(function ImageryList({ value = [], onPress }: any) {
  const renderItem = useCallback(
    ({ item, index }: any) => (
      <ImageryItem
        item={item}
        onPress={() => onPress(index)}
        className={`mx-1 h-16 w-16 ${index === 0 ? 'ml-0' : ''} ${index === value.length - 1 ? 'mr-0' : ''}`}
      />
    ),
    [onPress, value.length],
  );

  return (
    <FlatList
      data={value}
      horizontal={true}
      renderItem={renderItem}
      showsHorizontalScrollIndicator={false}
    />
  );
});
