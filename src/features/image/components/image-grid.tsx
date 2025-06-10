import { HStack } from '@/components/ui/hstack';
import _ from 'lodash';
import React from 'react';
import { useWindowDimensions } from 'react-native';
import { ImageItem } from './image-item';

export const ImageGrid = ({ value = [], onPress, onChange }: any) => {
  const { width: screenWidth } = useWindowDimensions();
  const numColumns = 4;
  const spacing = 16;
  const padding = 16;
  const imageSize = (screenWidth - padding * 2 - (numColumns - 1) * spacing) / numColumns;

  const onRemove = async (uri: string) => {
    onChange(_.filter(value, (item: any) => item.uri !== uri));
  };

  if (value.length > 0) {
    return (
      <HStack className="flex-wrap">
        {value.map((item: any, index: number) => (
          <ImageItem
            key={item.uri}
            className="my-2"
            style={{
              width: imageSize,
              height: imageSize,
              marginRight: (index + 1) % numColumns === 0 ? 0 : spacing,
            }}
            item={item}
            onPress={() => onPress(index)}
            onRemove={() => onRemove(item.uri)}
          />
        ))}
      </HStack>
    );
  }
};
