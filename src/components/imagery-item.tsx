import { Button, ButtonIcon } from '@/components/ui/button';
import { Ionicons } from '@expo/vector-icons';
import CachedImage from 'expo-cached-image';
import _ from 'lodash';
import { CircleX } from 'lucide-react-native';
import React, { memo } from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import { twMerge } from 'tailwind-merge';

export const ImageryItem: React.FC<any> = memo(function ImageryItem({
  source,
  alt,
  cacheKey,
  assetId,
  mime,
  onPress,
  onRemove,
  className,
  style,
  imageStyle,
  ...props
}) {
  const defaultStyle: any = {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  };

  const Wrapper = !!onPress ? TouchableOpacity : View;

  return (
    <Wrapper onPress={onPress}>
      <View className="items-center justify-center">
        {!!assetId ? (
          <Image
            source={source}
            alt={alt}
            style={[defaultStyle, style]}
            className={twMerge([className])}
            {...props}
          />
        ) : (
          <CachedImage
            source={source}
            cacheKey={cacheKey}
            alt={alt}
            style={[defaultStyle, style]}
            className={twMerge([className])}
            {...props}
          />
        )}

        {_.startsWith(mime, 'video') && (
          <View className="absolute">
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
      </View>
    </Wrapper>
  );
});
