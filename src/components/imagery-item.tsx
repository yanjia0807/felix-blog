import { isLocalFile } from '@/utils/file';
import { Ionicons } from '@expo/vector-icons';
import CachedImage from 'expo-cached-image';
import _ from 'lodash';
import { CircleX } from 'lucide-react-native';
import React, { memo } from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import { twMerge } from 'tailwind-merge';
import { Button, ButtonIcon } from './ui/button';

export const ImageryItem: React.FC<any> = memo(function ImageryItem({
  uri,
  alt,
  cacheKey,
  mime,
  onPress,
  onRemove,
  className,
  style,
  imageStyle,
  ...props
}) {
  const defaultStyle: any = {
    justifyContent: 'center',
    alignItems: 'center',
  };

  const Wrapper = !!onPress ? TouchableOpacity : View;

  return (
    <Wrapper onPress={onPress} style={[defaultStyle, style]} className={className}>
      {isLocalFile(uri) ? (
        <Image
          source={{ uri }}
          alt={alt ?? uri}
          style={{
            width: '100%',
            height: '100%',
          }}
          className={twMerge([className])}
          {...props}
        />
      ) : (
        <CachedImage
          source={{ uri }}
          cacheKey={cacheKey}
          alt={alt}
          style={{
            width: '100%',
            height: '100%',
          }}
          className={twMerge([className])}
          {...props}
        />
      )}

      {_.startsWith(mime, 'video') && (
        <View className="absolute self-center">
          <Ionicons name="play-circle-outline" size={24} className="opacity-50" color="white" />
        </View>
      )}
      {onRemove && (
        <Button
          size="xs"
          action="secondary"
          className="absolute right-0 top-0 h-auto p-1 opacity-80"
          onPress={onRemove}>
          <ButtonIcon as={CircleX} />
        </Button>
      )}
    </Wrapper>
  );
});
