import { HStack } from '@/components/ui/hstack';
import _ from 'lodash';
import React from 'react';
import { useWindowDimensions } from 'react-native';
import { ImageryItem } from './imagery-item';

export const ImageryGrid = ({ value = [], onPress, onChange }: any) => {
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
        {value.map((item: any, index: number) => {
          return (
            <ImageryItem
              key={item.name}
              uri={item.thumbnail}
              cacheKey={item.name}
              mime={item.mime}
              alt={item.alternativeText || item.name}
              className="my-2 rounded-md"
              style={{
                width: imageSize,
                height: imageSize,
                marginRight: (index + 1) % numColumns === 0 ? 0 : spacing,
              }}
              onPress={() => onPress(index)}
              onRemove={() => onRemove(item.uri)}
            />
          );
        })}
      </HStack>
    );
  }
};
